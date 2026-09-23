import { Fragment, type CSSProperties } from "react";

export function KineticText({ text, offset = 0 }: { text: string; offset?: number }) {
  return <>{text.split(" ").map((word, index) => <Fragment key={`${word}-${index}`}>{index > 0 && " "}<span className="kin" data-field="" style={{ "--i": index + offset } as CSSProperties}>{word}</span></Fragment>)}</>;
}
