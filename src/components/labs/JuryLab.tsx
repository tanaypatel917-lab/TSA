"use client";

import { useEffect, useRef, useState } from "react";
import { juryCopy, juryModels, juryPhotos, type JuryModel, type JuryModelId, type JuryPhotoId } from "@/content/jury";
import { LabFrame } from "./LabFrame";

type PanelResult = { photoId: JuryPhotoId; modelIds: JuryModelId[] };

function ModelQuestionMark({ modelId }: { modelId: JuryModelId }) {
  return <svg className="jury-avatar" data-model={modelId} viewBox="0 0 56 56" aria-hidden="true" focusable="false">
    <path d="M28 3c-13.8 0-23 9.8-23 24.2C5 42 13.1 53 28 53s23-11 23-25.8C51 12.8 41.8 3 28 3Z" fill="var(--clay)" stroke="var(--ink)" strokeWidth="2.5" />
    <circle cx="20" cy="22" r="2.5" fill="var(--ink)" />
    <circle cx="36" cy="22" r="2.5" fill="var(--ink)" />
    <text x="28" y="44" textAnchor="middle" fill="var(--ink)" fontFamily="Georgia, serif" fontSize="29" fontWeight="700">?</text>
  </svg>;
}

function PhotoArtwork({ id }: { id: JuryPhotoId }) {
  return <svg className={`jury-photo-art jury-photo-art-${id}`} viewBox="0 0 160 96" aria-hidden="true" focusable="false">
    {id === "a" && <>
      <rect width="160" height="96" fill="#C9DCEC" />
      <circle cx="128" cy="20" r="11" fill="#E9BD75" />
      <path d="M0 65Q38 48 78 64t82-2v34H0Z" fill="#A9BD83" />
      <ellipse cx="78" cy="65" rx="29" ry="17" fill="#D9A45C" stroke="var(--ink)" strokeWidth="2" />
      <circle cx="105" cy="56" r="13" fill="#D9A45C" stroke="var(--ink)" strokeWidth="2" />
      <path d="m97 47-3-11 11 7m8 3 8-8 1 14M57 76v10m30-9v9m21-14 8 8" fill="#D9A45C" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="110" cy="55" r="1.8" fill="var(--ink)" />
    </>}
    {id === "b" && <>
      <rect width="160" height="96" fill="#334462" />
      <circle cx="132" cy="19" r="10" fill="#F6EFE5" />
      <path d="M14 57h132v28H14z" fill="#7181A0" stroke="var(--ink)" strokeWidth="2" />
      <path d="M8 55q0-12 12-12h120q12 0 12 12v8H8z" fill="#8291AA" stroke="var(--ink)" strokeWidth="2" />
      <ellipse cx="78" cy="57" rx="27" ry="14" fill="#20283A" stroke="#111B2D" strokeWidth="2" />
      <circle cx="103" cy="47" r="14" fill="#20283A" stroke="#111B2D" strokeWidth="2" />
      <circle cx="97" cy="35" r="6" fill="#20283A" /><circle cx="109" cy="34" r="6" fill="#20283A" />
      <circle cx="108" cy="46" r="2" fill="#F6EFE5" />
      <path d="M57 67v8m28-7v8m21-15 8 7" fill="none" stroke="#111B2D" strokeWidth="3" strokeLinecap="round" />
    </>}
    {id === "c" && <>
      <rect width="160" height="96" fill="#F6EFE5" />
      <path d="M8 8h144v80H8z" fill="none" stroke="var(--ink)" strokeWidth="3" />
      <path d="M0 74 160 34M0 91 160 51M0 57 144 21" stroke="#D8CBB9" strokeWidth="2" />
      <ellipse cx="77" cy="59" rx="27" ry="16" fill="#E6B76F" stroke="var(--ink)" strokeWidth="3" />
      <circle cx="104" cy="48" r="14" fill="#E6B76F" stroke="var(--ink)" strokeWidth="3" />
      <path d="m96 38-2-12 12 8m6 3 10-10 1 15M59 69v10m31-9v9" fill="#E6B76F" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="108" cy="47" r="2" fill="var(--ink)" />
      <path d="M126 16h17v12h-17z" fill="var(--clay)" stroke="var(--ink)" strokeWidth="2" />
    </>}
    {id === "d" && <>
      <rect width="160" height="96" fill="#E9DCCB" />
      <rect x="15" y="12" width="38" height="34" fill="#C8DDF0" stroke="var(--ink)" strokeWidth="2" />
      <path d="M0 73h160v23H0z" fill="#BA9E7C" />
      <ellipse cx="79" cy="62" rx="34" ry="13" fill="#8B715A" stroke="var(--ink)" strokeWidth="2" />
      <path d="M97 57 105 31q2-8 10-8t10 8l5 30" fill="#8B715A" stroke="var(--ink)" strokeWidth="2" />
      <ellipse cx="117" cy="25" rx="13" ry="12" fill="#8B715A" stroke="var(--ink)" strokeWidth="2" />
      <path d="m108 17-6-10 13 6m11 3 9-8-2 15M57 69v20m39-20v20m27-22v22" fill="#8B715A" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="122" cy="24" r="1.8" fill="var(--ink)" />
    </>}
    {id === "e" && <>
      <rect width="160" height="96" fill="#C9DCEC" />
      <path d="M0 63Q40 52 80 65t80-3v34H0Z" fill="#A9BD83" />
      <ellipse cx="76" cy="65" rx="28" ry="16" fill="#E2C9A8" stroke="var(--ink)" strokeWidth="2" />
      <circle cx="104" cy="53" r="15" fill="#E2C9A8" stroke="var(--ink)" strokeWidth="2" />
      <path d="m92 43 2-15 12 10m7 0 12-11 2 17M52 62q-19-17-20-3t19 14" fill="#E2C9A8" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M60 77v9m30-9v9" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="109" cy="52" r="1.8" fill="var(--ink)" />
      <path d="m119 56 4 2-4 2m2-2h5" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" />
    </>}
  </svg>;
}

function modelById(id: JuryModelId): JuryModel {
  return juryModels.find((model) => model.id === id)!;
}

export function JuryLab() {
  const [selectedModels, setSelectedModels] = useState<JuryModelId[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<JuryPhotoId | null>(null);
  const [fullHint, setFullHint] = useState(false);
  const [result, setResult] = useState<PanelResult | null>(null);
  const tallyHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (result) tallyHeading.current?.focus();
  }, [result]);

  function toggleModel(modelId: JuryModelId) {
    if (selectedModels.includes(modelId)) {
      setSelectedModels((current) => current.filter((id) => id !== modelId));
      setFullHint(false);
      setResult(null);
      return;
    }
    if (selectedModels.length >= 3) {
      setFullHint(true);
      return;
    }
    setSelectedModels((current) => [...current, modelId]);
    setFullHint(false);
    setResult(null);
  }

  function choosePhoto(photoId: JuryPhotoId) {
    setSelectedPhoto(photoId);
    setResult(null);
  }

  const resultPhoto = result ? juryPhotos.find((photo) => photo.id === result.photoId)! : null;
  const resultVotes = result
    ? result.modelIds.map((id) => ({ model: modelById(id), vote: modelById(id).votes[result.photoId] }))
    : [];
  const dogCount = resultVotes.filter(({ vote }) => vote.label === "dog").length;
  const notDogCount = resultVotes.length - dogCount;
  const hoodModels = selectedModels.map(modelById);

  const hoodContent = <>
    {hoodModels.length > 0 && <ul className="jury-hood-list">{hoodModels.map((model) => {
      const vote = selectedPhoto ? model.votes[selectedPhoto] : null;
      return <li key={model.id}>
        <strong>{model.name}</strong>
        <span>Trained on: {model.trainedOn}</span>
        <span>{vote ? `Current vote reason: “${vote.reason}”` : "Pick a photo to see this model's reason."}</span>
      </li>;
    })}</ul>}
    <p className="jury-hood-conclusion">{juryCopy.hoodConclusion}</p>
  </>;

  return <LabFrame id="lab-jury" kicker={juryCopy.kicker} title={juryCopy.title} note={juryCopy.note} hood={{ spec: juryCopy.spec, content: hoodContent }}>
    <section className="jury-pick-section" aria-labelledby="jury-model-heading">
      <div className="jury-section-heading">
        <h4 id="jury-model-heading">{juryCopy.chooseModels}</h4>
        <p className="jury-pick-count" role="status" aria-live="polite" aria-atomic="true">{selectedModels.length} of 3 picked</p>
      </div>
      <div className="jury-model-grid">
        {juryModels.map((model) => {
          const pressed = selectedModels.includes(model.id);
          const vote = result?.modelIds.includes(model.id) ? model.votes[result.photoId] : null;
          const right = vote && resultPhoto ? vote.label === resultPhoto.truth : false;
          return <button
            key={model.id}
            type="button"
            className="jury-model-card"
            data-selected={pressed}
            data-model-id={model.id}
            aria-pressed={pressed}
            aria-label={`${model.name}. Trained on: ${model.trainedOn}`}
            onClick={() => toggleModel(model.id)}
          >
            <span className="jury-model-top"><ModelQuestionMark modelId={model.id} /><span className="jury-model-name">{model.name}</span></span>
            <span className="jury-model-training">Trained on: {model.trainedOn}</span>
            {vote && <span className="jury-model-result">
              <span className="jury-vote-stamp" data-vote={vote.label}>{vote.label === "dog" ? "Dog" : "Not a dog"}</span>
              <span>{vote.confidence}% confidence</span>
              <strong className="jury-vote-correctness" data-right={right}>{right ? "Right" : "Wrong"}</strong>
            </span>}
          </button>;
        })}
      </div>
      <p className="jury-full-hint" role="status" aria-live="polite">{fullHint ? juryCopy.fullHint : ""}</p>
    </section>

    <section className="jury-pick-section" aria-labelledby="jury-photo-heading">
      <h4 id="jury-photo-heading">{juryCopy.choosePhoto}</h4>
      <div className="jury-photo-grid" role="group" aria-labelledby="jury-photo-heading">
        {juryPhotos.map((photo) => <button
          key={photo.id}
          type="button"
          className="jury-photo-card"
          data-photo-id={photo.id}
          aria-pressed={selectedPhoto === photo.id}
          onClick={() => choosePhoto(photo.id)}
        >
          <PhotoArtwork id={photo.id} />
          <span>{photo.caption}</span>
        </button>)}
      </div>
    </section>

    <button
      className="button-primary jury-ask-button"
      type="button"
      disabled={selectedModels.length !== 3 || selectedPhoto === null}
      onClick={() => selectedPhoto && setResult({ photoId: selectedPhoto, modelIds: [...selectedModels] })}
    >
      {juryCopy.ask}
    </button>

    {result && resultPhoto && <section className="jury-result" aria-labelledby="jury-result-heading">
      <h4 id="jury-result-heading" ref={tallyHeading} tabIndex={-1}>{juryCopy.tallyHeading}</h4>
      <p className="jury-tally">{dogCount} {dogCount === 1 ? "says" : "say"} Dog, {notDogCount} {notDogCount === 1 ? "says" : "say"} Not a dog</p>
      <p className="jury-correct-answer"><strong>Correct answer:</strong> {resultPhoto.truth === "dog" ? "Dog" : "Not a dog, it's a cat"}</p>
      <ul className="jury-vote-review">
        {resultVotes.map(({ model, vote }) => <li key={model.id} data-right={vote.label === resultPhoto.truth}>
          <strong>{model.name}</strong>
          <span>{vote.label === "dog" ? "Dog" : "Not a dog"} · {vote.confidence}%</span>
          <span>{vote.label === resultPhoto.truth ? "Right" : "Wrong"}</span>
        </li>)}
      </ul>
    </section>}
  </LabFrame>;
}
