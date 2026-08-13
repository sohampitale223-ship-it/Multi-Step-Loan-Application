import { useEffect, useRef, useState } from 'react'
import ReactSignatureCanvas from 'react-signature-canvas'

export default function SignatureCanvas({ value, onChange, error }) {
  const pad = useRef(null)
  const container = useRef(null)
  const [captured, setCaptured] = useState(Boolean(value))
  useEffect(() => {
    const resize = () => { const canvas = pad.current?.getCanvas(); if (!canvas || !container.current) return; const data = pad.current.isEmpty() ? null : pad.current.toData(); canvas.width = container.current.clientWidth; canvas.height = 176; if (data) pad.current.fromData(data) }
    resize(); const observer = new ResizeObserver(resize); if (container.current) observer.observe(container.current); return () => observer.disconnect()
  }, [])
  const capture = () => { if (!pad.current?.isEmpty()) { onChange(pad.current.toDataURL('image/png')); setCaptured(true) } }
  const clear = () => { pad.current?.clear(); onChange(''); setCaptured(false) }
  return <div className="signature-field" ref={container}>
    <label id="esign-label">E-Signature <span aria-hidden="true">*</span></label><p id="esign-help" className="form-help">Please sign inside the box using a mouse or touch.</p>
    <ReactSignatureCanvas ref={pad} canvasProps={{ className: 'signature-canvas', 'aria-labelledby': 'esign-label', 'aria-describedby': 'esign-help esign-error' }} onEnd={capture} />
    {captured && <p className="signature-captured" role="status">✓ Signature captured</p>}{value && <img className="signature-preview" src={value} alt="Captured signature preview" />}
    {error && <p id="esign-error" className="form-error" role="alert">{error}</p>}
    <button className="button button--secondary signature-clear" type="button" onClick={clear}>Clear Signature</button>
  </div>
}
