import { KineticText } from "@/components/Kinetic";
import Link from "next/link";
import { VoxelGlyph } from "@/components/three/VoxelGlyph";

export default function NotFound() {
  return <section className="not-found" aria-labelledby="not-found-title"><div className="shell"><p className="page-hero-label">Error 404</p><h1 id="not-found-title"><KineticText text="That question has no page yet." /></h1><p>The link may be old or mistyped. Here are a few good places to pick up again.</p><div className="not-found-links"><Link href="/modules" className="button-primary">Explore lessons <span aria-hidden="true">↗</span></Link><Link href="/" className="button-secondary">Go to the home page</Link><Link href="/glossary" className="text-link text-link--arrow"><span className="text-link-label">Look up a term </span><span aria-hidden="true">↗</span></Link></div></div><span className="not-found-mark" aria-hidden="true">?</span><VoxelGlyph mark="404" className="nf-voxel" /></section>;
}
