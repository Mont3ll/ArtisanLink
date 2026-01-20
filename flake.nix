{
  description = "Dev shell for Prisma/Node.js project";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { nixpkgs, ... }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
  in {
    devShells.${system}.default = pkgs.mkShell {
      buildInputs = with pkgs; [
        prisma_7
        prisma-engines_7
      ];
      shellHook = ''
        export PKG_CONFIG_PATH="${pkgs.openssl.dev}/lib/pkgconfig"
        export PRISMA_SCHEMA_ENGINE_BINARY="${pkgs.prisma-engines_7}/bin/schema-engine"
        export PRISMA_QUERY_ENGINE_BINARY="${pkgs.prisma-engines_7}/bin/query-engine"
        export PRISMA_QUERY_ENGINE_LIBRARY="${pkgs.prisma-engines_7}/lib/libquery_engine.node"
        export PRISMA_FMT_BINARY="${pkgs.prisma-engines_7}/bin/prisma-fmt"
      '';
    };
  };
}
