const IMAGE_TYPES = new Set(['image/jpeg', 'image/png'])

export async function compressImage(file, { maxDimension = 1800, quality = 0.78 } = {}) {
  if (!IMAGE_TYPES.has(file.type)) return { file, originalSize: file.size, compressedSize: file.size, compressed: false }
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width; canvas.height = height
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)
    bitmap.close?.()
    const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    const blob = await new Promise((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Image compression failed')), type, quality))
    const output = blob.size < file.size ? new File([blob], file.name, { type, lastModified: file.lastModified }) : file
    return { file: output, originalSize: file.size, compressedSize: output.size, compressed: output !== file, width, height }
  } catch (error) {
    return { file, originalSize: file.size, compressedSize: file.size, compressed: false, error: error instanceof Error ? error.message : 'Image compression failed' }
  }
}

