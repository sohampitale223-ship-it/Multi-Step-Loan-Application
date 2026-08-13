import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { compressImage } from '../../utils/imageCompression'

const MAX_SIZE = 5 * 1024 * 1024
const ACCEPT = { 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }
const formatSize = (size) => `${(size / 1024 / 1024).toFixed(2)} MB`
function ImagePreview({ url }) { useEffect(() => () => URL.revokeObjectURL(url), [url]); return <img src={url} alt="" /> }

export default function FileUpload({ id, label, files = [], onChange, error }) {
  const [message, setMessage] = useState('')
  const [processing, setProcessing] = useState(false)
  const [previewUrls, setPreviewUrls] = useState({})
  const acceptFiles = async (accepted, rejected) => {
    const messages = rejected.flatMap(({ errors }) => errors.map(({ code }) => code === 'file-too-large' ? 'File size must not exceed 5 MB.' : 'Only PDF, JPG and PNG files are allowed.'))
    if (files.length + accepted.length > 3) messages.push('Maximum 3 files allowed for this document.')
    const available = Math.max(0, 3 - files.length)
    const selected = accepted.slice(0, available)
    setMessage([...new Set(messages)].join(' '))
    if (!selected.length) return
    setProcessing(true)
    const next = []
    for (const original of selected) {
      const result = await compressImage(original)
      const file = result.file
      const item = { id: `${Date.now()}-${crypto.randomUUID?.() || Math.random()}`, name: file.name, type: file.type, size: file.size, lastModified: file.lastModified, compressed: result.compressed }
      setPreviewUrls((current) => ({ ...current, [item.id]: URL.createObjectURL(file) })); next.push(item)
    }
    onChange([...files, ...next]); setProcessing(false)
  }
  const remove = (file) => { setPreviewUrls((current) => { const next = { ...current }; delete next[file.id]; return next }); onChange(files.filter(({ id: fileId }) => fileId !== file.id)); setMessage('') }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ accept: ACCEPT, maxSize: MAX_SIZE, maxFiles: 3, onDrop: acceptFiles, disabled: processing })
  return <div id={id} className="file-upload" tabIndex="-1">
    <div {...getRootProps({ className: `file-dropzone${isDragActive ? ' file-dropzone--active' : ''}`, 'aria-label': `${label} file upload` })}>
      <input {...getInputProps()} /><strong>{isDragActive ? 'Drop files here' : 'Drag and drop files here, or click to browse'}</strong><span>PDF, JPG or PNG · maximum 5 MB · up to 3 files</span>
    </div>
    {processing && <p className="file-processing" role="status">Processing image...</p>}
    {(message || error) && <p className="form-error" role="alert" aria-live="assertive">{message || error}</p>}
    {files.length > 0 && <ul className="file-preview-list">{files.map((file) => <li key={file.id} className="file-preview">
      {file.type.startsWith('image/') && previewUrls[file.id] ? <ImagePreview url={previewUrls[file.id]} /> : <span className="file-preview__icon" aria-hidden="true">{file.type === 'application/pdf' ? 'PDF' : 'IMG'}</span>}
      <span className="file-preview__details"><strong>{file.name}</strong><small>{formatSize(file.size)}{file.compressed ? ' · compressed' : ''}{!previewUrls[file.id] ? ' · restored metadata' : ''}</small></span>
      <span className="document-status">Uploaded</span><button type="button" className="file-remove" onClick={() => remove(file)} aria-label={`Remove ${file.name}`}>Remove</button>
    </li>)}</ul>}
  </div>
}
