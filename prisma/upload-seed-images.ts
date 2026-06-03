/**
 * Upload seed images to Cloudinary and print the resulting URLs.
 * Usage: npx tsx prisma/upload-seed-images.ts
 */
import 'dotenv/config'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const IMAGES_DIR = `${process.env.HOME}/Downloads/chapaworks_images`

const filesToUpload = [
  { local: 'close-up-smiley-man-with-glasses.jpg', folder: 'profile-images',  publicId: 'seed-artisan-profile' },
  { local: 'portfolio-asset-compressed.jpg',        folder: 'portfolio',        publicId: 'seed-portfolio-1' },
  { local: 'portfolio-asset-2-compressed.jpg',      folder: 'portfolio',        publicId: 'seed-portfolio-2' },
  { local: 'portfolio-asset-3-compressed.jpg',      folder: 'portfolio',        publicId: 'seed-portfolio-3' },
  { local: 'test_id.png',                            folder: 'id-documents',     publicId: 'seed-artisan-id' },
  { local: 'woodworking-cert.avif',                  folder: 'certificates',     publicId: 'seed-artisan-cert' },
] as const

async function main() {
  const urls: Record<string, string> = {}

  for (const file of filesToUpload) {
    const path = resolve(IMAGES_DIR, file.local)
    let data: string
    try {
      const buf = readFileSync(path)
      const mime = file.local.endsWith('.png') ? 'image/png'
        : file.local.endsWith('.avif') ? 'image/avif'
        : 'image/jpeg'
      data = `data:${mime};base64,${buf.toString('base64')}`
    } catch {
      console.error(`Cannot read ${path}`)
      continue
    }

    console.log(`Uploading ${file.local}…`)
    const result = await cloudinary.uploader.upload(data, {
      folder: `chapaworks/${file.folder}`,
      public_id: file.publicId,
      overwrite: true,
      unique_filename: false,
      resource_type: 'auto',
    })
    urls[file.publicId] = result.secure_url
    console.log(`  ✓ ${result.secure_url}`)
  }

  console.log('\n// Paste these into prisma/seed/seed-image-urls.ts:\n')
  console.log('export const SEED_IMAGE_URLS = ' + JSON.stringify(urls, null, 2) + ' as const\n')
}

main().catch((e) => { console.error(e); process.exit(1) })
