import { Link } from "react-router-dom";
import { Compass, Map as MapIcon } from "lucide-react";
import useDocumentTitle from "../lib/useDocumentTitle.js";
import StateBox from "../components/ui/StateBox.jsx";

export default function NotFoundPage() {
  useDocumentTitle("Página no encontrada");
  return (
    <div className="page page-narrow">
      <StateBox icon={Compass} title="Esta página no existe" action={<Link className="btn btn-primary" to="/"><MapIcon size={17} aria-hidden="true" /> Ir al mapa</Link>}>
        Puede que el enlace esté mal escrito o que la página se haya movido.
      </StateBox>
    </div>
  );
}
