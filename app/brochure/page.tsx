import { Brochure } from "./brochure-content";
import { COPY_EN } from "./copy";
import "./brochure.css";

export default function BrochurePage() {
  return <Brochure copy={COPY_EN} />;
}
