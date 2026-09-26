// High tier only: bloom for the emissive highlights, a soft vignette, AgX tone mapping last (the composer
// forces NoToneMapping on the renderer, so the ToneMapping effect has to be the final pass).
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

export default function Effects() {
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.05} intensity={0.9} radius={0.7} />
      <Vignette offset={0.28} darkness={0.55} />
      <ToneMapping mode={ToneMappingMode.AGX} />
    </EffectComposer>
  );
}
