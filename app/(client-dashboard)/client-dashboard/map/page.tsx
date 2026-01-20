"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import mapboxgl, { GeoJSONSource } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Search,
  MapPin,
  Star,
  Locate,
  Loader2,
  Filter,
  X,
  MessageSquare,
  BadgeCheck,
  RefreshCw,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Types
interface Artisan {
  id: string;
  profileId: string;
  name: string;
  profession: string | null;
  bio: string | null;
  profileImage: string | null;
  location: {
    city: string | null;
    county: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  experience: number | null;
  hourlyRate: number | null;
  isAvailable: boolean;
  isVerified: boolean;
  rating: {
    average: number;
    total: number;
  };
  specializations: Array<{ name: string; skillLevel: number }>;
  distance: number | null;
}

interface SearchResponse {
  artisans: Artisan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Kenya center
const KENYA_CENTER: [number, number] = [37.9062, 0.0236];
const DEFAULT_ZOOM = 6;
const CLUSTER_SOURCE_ID = "artisans-source";
const CLUSTER_LAYER_ID = "clusters";
const CLUSTER_COUNT_LAYER_ID = "cluster-count";
const UNCLUSTERED_LAYER_ID = "unclustered-point";

export default function MapSearchPage() {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  // State
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchArea, setShowSearchArea] = useState(false);
  const [currentBounds, setCurrentBounds] = useState<{
    ne: [number, number];
    sw: [number, number];
    center: [number, number];
  } | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    profession: "",
    minRating: "",
    available: false,
    verified: false,
  });

  // Fetch artisans within bounds
  const fetchArtisans = useCallback(
    async (bounds?: { ne: [number, number]; sw: [number, number]; center: [number, number] }) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        if (filters.profession) params.set("profession", filters.profession);
        if (filters.minRating) params.set("minRating", filters.minRating);
        if (filters.available) params.set("available", "true");
        if (filters.verified) params.set("verified", "true");
        params.set("limit", "100");

        // Add geo params if bounds provided
        if (bounds) {
          params.set("lat", bounds.center[1].toString());
          params.set("lng", bounds.center[0].toString());
          // Calculate rough radius from bounds (diagonal distance / 2)
          const latDiff = Math.abs(bounds.ne[1] - bounds.sw[1]);
          const lngDiff = Math.abs(bounds.ne[0] - bounds.sw[0]);
          const radius = Math.max(latDiff, lngDiff) * 111 / 2; // rough km
          params.set("radius", Math.min(radius, 200).toString());
        } else if (userLocation) {
          params.set("lat", userLocation[1].toString());
          params.set("lng", userLocation[0].toString());
          params.set("radius", "50");
        }

        const response = await fetch(`/api/search/artisans?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch artisans");

        const data: SearchResponse = await response.json();
        setArtisans(data.artisans.filter((a) => a.location.latitude && a.location.longitude));
      } catch (error) {
        console.error("Error fetching artisans:", error);
      } finally {
        setIsLoading(false);
        setShowSearchArea(false);
      }
    },
    [searchQuery, filters, userLocation]
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!token) {
      setMapError(
        "Mapbox access token not configured. Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your environment."
      );
      return;
    }

    try {
      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: KENYA_CENTER,
        zoom: DEFAULT_ZOOM,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.current.on("load", () => {
        if (!map.current) return;

        // Add empty GeoJSON source for clustering
        map.current.addSource(CLUSTER_SOURCE_ID, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
          cluster: true,
          clusterMaxZoom: 14, // Max zoom to cluster points
          clusterRadius: 50, // Radius of each cluster in pixels
        });

        // Add cluster circles layer
        map.current.addLayer({
          id: CLUSTER_LAYER_ID,
          type: "circle",
          source: CLUSTER_SOURCE_ID,
          filter: ["has", "point_count"],
          paint: {
            // Cluster size based on point count
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#22C55E", // Green for small clusters
              10,
              "#F59E0B", // Amber for medium clusters
              30,
              "#EF4444", // Red for large clusters
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              10,
              30,
              30,
              40,
            ],
            "circle-stroke-width": 3,
            "circle-stroke-color": "#ffffff",
          },
        });

        // Add cluster count labels
        map.current.addLayer({
          id: CLUSTER_COUNT_LAYER_ID,
          type: "symbol",
          source: CLUSTER_SOURCE_ID,
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          },
          paint: {
            "text-color": "#ffffff",
          },
        });

        // Add unclustered point layer (individual markers)
        map.current.addLayer({
          id: UNCLUSTERED_LAYER_ID,
          type: "circle",
          source: CLUSTER_SOURCE_ID,
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": [
              "case",
              ["get", "isAvailable"],
              "#22C55E", // Green for available
              "#6B7280", // Gray for unavailable
            ],
            "circle-radius": 12,
            "circle-stroke-width": 3,
            "circle-stroke-color": "#ffffff",
          },
        });

        // Click on cluster to zoom in
        map.current.on("click", CLUSTER_LAYER_ID, (e) => {
          const features = map.current!.queryRenderedFeatures(e.point, {
            layers: [CLUSTER_LAYER_ID],
          });
          if (!features.length) return;
          
          const clusterId = features[0].properties?.cluster_id;
          const source = map.current!.getSource(CLUSTER_SOURCE_ID) as GeoJSONSource;
          
          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            const geometry = features[0].geometry;
            if (geometry.type === "Point") {
              map.current!.easeTo({
                center: geometry.coordinates as [number, number],
                zoom: zoom ?? 12,
              });
            }
          });
        });

        // Click on unclustered point to select artisan
        map.current.on("click", UNCLUSTERED_LAYER_ID, (e) => {
          const features = map.current!.queryRenderedFeatures(e.point, {
            layers: [UNCLUSTERED_LAYER_ID],
          });
          if (!features.length) return;

          const props = features[0].properties;
          if (!props) return;

          // Find the artisan from our state
          const artisan = artisans.find((a) => a.id === props.id);
          if (artisan) {
            setSelectedArtisan(artisan);
            const geometry = features[0].geometry;
            if (geometry.type === "Point") {
              map.current!.flyTo({
                center: geometry.coordinates as [number, number],
                zoom: 12,
              });
            }
          }
        });

        // Change cursor on hover
        map.current.on("mouseenter", CLUSTER_LAYER_ID, () => {
          if (map.current) map.current.getCanvas().style.cursor = "pointer";
        });
        map.current.on("mouseleave", CLUSTER_LAYER_ID, () => {
          if (map.current) map.current.getCanvas().style.cursor = "";
        });
        map.current.on("mouseenter", UNCLUSTERED_LAYER_ID, () => {
          if (map.current) map.current.getCanvas().style.cursor = "pointer";
        });
        map.current.on("mouseleave", UNCLUSTERED_LAYER_ID, () => {
          if (map.current) map.current.getCanvas().style.cursor = "";
        });

        setMapLoaded(true);
        // Initial fetch
        fetchArtisans();
      });

      // Track map movement for "search this area"
      map.current.on("moveend", () => {
        if (!map.current) return;
        const bounds = map.current.getBounds();
        if (!bounds) return;
        const center = map.current.getCenter();
        setCurrentBounds({
          ne: [bounds.getNorthEast().lng, bounds.getNorthEast().lat],
          sw: [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
          center: [center.lng, center.lat],
        });
        setShowSearchArea(true);
      });

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
        setMapError("Failed to load map.");
      });
    } catch (error) {
      console.error("Map initialization error:", error);
      setMapError("Failed to initialize map.");
    }

    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update GeoJSON source when artisans change
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const source = map.current.getSource(CLUSTER_SOURCE_ID) as GeoJSONSource;
    if (!source) return;

    // Convert artisans to GeoJSON features
    const features: GeoJSON.Feature<GeoJSON.Point>[] = artisans
      .filter((a) => a.location.latitude && a.location.longitude)
      .map((artisan) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [artisan.location.longitude!, artisan.location.latitude!],
        },
        properties: {
          id: artisan.id,
          profileId: artisan.profileId,
          name: artisan.name,
          profession: artisan.profession,
          profileImage: artisan.profileImage,
          isAvailable: artisan.isAvailable,
          isVerified: artisan.isVerified,
          rating: artisan.rating.average,
          reviewCount: artisan.rating.total,
        },
      }));

    // Update the source data
    source.setData({
      type: "FeatureCollection",
      features,
    });

    // Fit bounds to show all markers (only on initial load without user location)
    if (artisans.length > 0 && !userLocation) {
      const bounds = new mapboxgl.LngLatBounds();
      artisans.forEach((a) => {
        if (a.location.longitude && a.location.latitude) {
          bounds.extend([a.location.longitude, a.location.latitude]);
        }
      });
      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
      }
    }
  }, [artisans, mapLoaded, userLocation]);

  // Add user location marker
  useEffect(() => {
    if (!mapLoaded || !map.current || !userLocation) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Create user location marker
    const el = document.createElement("div");
    el.className = "user-location-marker";
    el.style.width = "20px";
    el.style.height = "20px";
    el.style.borderRadius = "50%";
    el.style.backgroundColor = "#3B82F6";
    el.style.border = "3px solid white";
    el.style.boxShadow = "0 0 0 8px rgba(59, 130, 246, 0.3)";

    userMarkerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat(userLocation)
      .addTo(map.current);

    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    };
  }, [mapLoaded, userLocation]);

  // Get user location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setUserLocation([longitude, latitude]);
        map.current?.flyTo({
          center: [longitude, latitude],
          zoom: 12,
        });
        setIsLocating(false);
        // Fetch artisans near user
        fetchArtisans({
          ne: [longitude + 0.5, latitude + 0.5],
          sw: [longitude - 0.5, latitude - 0.5],
          center: [longitude, latitude],
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to get your location. Please enable location services.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Search this area
  const searchThisArea = () => {
    if (currentBounds) {
      fetchArtisans(currentBounds);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArtisans(currentBounds || undefined);
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      profession: "",
      minRating: "",
      available: false,
      verified: false,
    });
    setSearchQuery("");
  };

  // Error state
  if (mapError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Map Not Available</h3>
            <p className="text-muted-foreground mb-4">{mapError}</p>
            <Button asChild>
              <Link href="/client-dashboard/find-artisans">
                Use List View Instead
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Map View</h1>
          <p className="text-sm text-muted-foreground">
            Find artisans near you on the map
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={getUserLocation}
            disabled={isLocating}
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Locate className="h-4 w-4 mr-2" />
            )}
            My Location
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/client-dashboard/find-artisans">
              <Search className="h-4 w-4 mr-2" />
              List View
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search artisans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </form>

        {/* Filter Sheet */}
        <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Artisans</SheetTitle>
                <SheetDescription>
                  Narrow down your search results
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-3">
                  <Label>Profession</Label>
                  <Select
                    value={filters.profession}
                    onValueChange={(v) => handleFilterChange("profession", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All professions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All professions</SelectItem>
                      <SelectItem value="carpenter">Carpenter</SelectItem>
                      <SelectItem value="electrician">Electrician</SelectItem>
                      <SelectItem value="plumber">Plumber</SelectItem>
                      <SelectItem value="painter">Painter</SelectItem>
                      <SelectItem value="mason">Mason</SelectItem>
                      <SelectItem value="welder">Welder</SelectItem>
                      <SelectItem value="tailor">Tailor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Minimum Rating</Label>
                  <Select
                    value={filters.minRating}
                    onValueChange={(v) => handleFilterChange("minRating", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any rating</SelectItem>
                      <SelectItem value="4.5">4.5+ stars</SelectItem>
                      <SelectItem value="4">4+ stars</SelectItem>
                      <SelectItem value="3.5">3.5+ stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="available"
                    checked={filters.available}
                    onCheckedChange={(c) => handleFilterChange("available", c === true)}
                  />
                  <Label htmlFor="available">Available now</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={filters.verified}
                    onCheckedChange={(c) => handleFilterChange("verified", c === true)}
                  />
                  <Label htmlFor="verified">Verified only</Label>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetFilters} className="flex-1">
                    Reset
                  </Button>
                  <Button onClick={() => fetchArtisans(currentBounds || undefined)} className="flex-1">
                    Apply
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      {/* Map Card Container */}
      <Card className="flex-1 overflow-hidden">
        <div className="relative h-[600px]">
          <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

        {/* Loading overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-background flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}

        {/* Search this area button */}
        {showSearchArea && mapLoaded && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <Button onClick={searchThisArea} disabled={isLoading} className="shadow-lg">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Search this area
            </Button>
          </div>
        )}

        {/* Results count */}
        {mapLoaded && (
          <div className="absolute top-4 left-4 z-10">
            <Badge variant="secondary" className="shadow-lg">
              {artisans.length} artisan{artisans.length !== 1 ? "s" : ""} found
            </Badge>
          </div>
        )}

        {/* Selected Artisan Card */}
        {selectedArtisan && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-10">
            <Card className="shadow-xl">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={selectedArtisan.profileImage || undefined}
                        alt={selectedArtisan.name}
                      />
                      <AvatarFallback>
                        {selectedArtisan.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">
                          {selectedArtisan.name}
                        </CardTitle>
                        {selectedArtisan.isVerified && (
                          <BadgeCheck className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <CardDescription>
                        {selectedArtisan.profession || "Artisan"}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedArtisan(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">
                      {selectedArtisan.rating.average.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">
                      ({selectedArtisan.rating.total})
                    </span>
                  </div>
                  {selectedArtisan.isAvailable && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Available
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {[selectedArtisan.location.city, selectedArtisan.location.county]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                  {selectedArtisan.distance !== null && (
                    <span className="ml-1">
                      ({selectedArtisan.distance} km away)
                    </span>
                  )}
                </div>

                {selectedArtisan.hourlyRate && (
                  <p className="text-sm font-medium">
                    KES {selectedArtisan.hourlyRate.toLocaleString()}/hr
                  </p>
                )}

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" asChild>
                    <Link href={`/client-dashboard/messages?artisan=${selectedArtisan.id}`}>
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Contact
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      router.push(
                        `/client-dashboard/find-artisans?q=${encodeURIComponent(
                          selectedArtisan.name
                        )}`
                      )
                    }
                  >
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Legend */}
        {mapLoaded && (
          <div className="absolute bottom-4 right-4 z-10 hidden md:block">
            <Card className="shadow-lg">
              <CardContent className="p-3">
                <p className="text-xs font-medium mb-2">Legend</p>
                <div className="space-y-2 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Availability</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 border border-white" />
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500 dark:bg-gray-400 border border-white" />
                        <span>Not Available</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-2">
                    <p className="text-muted-foreground mb-1">Clusters</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                          <Users className="w-2 h-2 text-white" />
                        </div>
                        <span>&lt; 10 artisans</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center">
                          <Users className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span>10-30 artisans</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                          <Users className="w-3 h-3 text-white" />
                        </div>
                        <span>30+ artisans</span>
                      </div>
                    </div>
                  </div>
                  {userLocation && (
                    <div className="border-t pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500 border border-white" />
                        <span>Your Location</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      </Card>
    </div>
  );
}
