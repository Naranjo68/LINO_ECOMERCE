import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
export default function NoEncontrado() { return <div className="container info-page"><p className="overline">ERROR 404</p><h1>Esta página<br/><em>no existe.</em></h1><p className="info-lead">Puede que la dirección haya cambiado. Vuelve al inicio o explora nuestras prendas.</p><Link to="/" className="btn btn-dark"><ArrowLeft size={18}/> Volver al inicio</Link></div>; }
