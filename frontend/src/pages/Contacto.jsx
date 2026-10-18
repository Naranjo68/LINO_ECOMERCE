import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
export default function Contacto() {
  return <div className="container info-page contact-page"><p className="overline">HABLEMOS DE LINO</p><h1>Estamos construyendo<br/><em>algo especial.</em></h1><p className="info-lead">Este sitio forma parte de un proyecto académico de comercio electrónico. No dispone de atención comercial ni recibe pedidos reales.</p><div className="contact-notice"><Mail size={29}/><div><h2>Canal de contacto</h2><p>En una etapa posterior se incorporará un formulario de consultas o un correo oficial. No se recopilan datos personales en este prototipo.</p></div></div><Link className="text-link" to="/"><ArrowLeft size={18}/> Volver al inicio</Link></div>;
}
