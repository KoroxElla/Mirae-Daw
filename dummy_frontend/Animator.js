console.log("🧠 Animator module loaded");

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";

/* =========================
   BLENDSHAPE MAP
   (extend per avatar)
========================= */
const BLENDSHAPE_MAP = {
  eye_openness_left: "eyeWideLeft",
  eye_openness_right: "eyeWideRight",
  mouth_smile: "mouthSmile",
  brow_lower: "browDownLeft",
  brow_raise_left: "browOuterUpLeft",
  brow_raise_right: "browOuterUpRight"
};

export class Animator {
  constructor() {
    this.time = 0;
    this.faceMeshes = [];

    this.bones = {};

    this.currentFaceState = {};
    this.targetFaceState = {};
    this.breathing = {
	rate: 0.35,
	amplitude: 0.05
    };
    this.arousal = 0;  

  }

  /* =========================
     AVATAR BINDING
  ========================= */
  bindAvatar(avatar) {
    avatar.traverse((child) => {
      // BONES
      if (child.isBone) {
        this.bones[child.name] = child;
      }

      // FACE MESHES (morph targets)
      if (child.isMesh && child.morphTargetDictionary) {
        this.faceMeshes.push(child);
      }
    });

    console.log("🦴 Bones detected:", Object.keys(this.bones));
    console.log("🙂 Face meshes:", this.faceMeshes.length);
  }

   mapBlendshape(key) {
  const MAP = {
    eye_openness_left: "eyeWideLeft",
    eye_openness_right: "eyeWideRight",
    mouth_smile: "mouthSmile",
    brow_lower: "browDownLeft"
  };
  return MAP[key];
}


  /* =========================
     SCHEMA APPLICATION
  ========================= */
  applySchema(schema) {
    if (schema.face) {
      Object.assign(this.targetFaceState, schema.face);
    }

    if (schema.emotion?.arousal !== undefined) {
      this.arousal = schema.emotion.arousal;
    }
  }

  /* =========================
     UPDATE LOOP
  ========================= */
  update(delta) {
    this.time += delta;

    this.updateBreathing(delta);
    this.updateFaceProcedural();
    this.updateFaceMorphs(delta);
  }

  /* =========================
     FACE TRANSITIONS
  ========================= */
  updateFaceMorphs(delta) {
  this.faceMeshes.forEach((mesh) => {
    const dict = mesh.morphTargetDictionary;
    const influences = mesh.morphTargetInfluences;

    for (const [key, target] of Object.entries(this.targetFaceState)) {
      const morphName = this.mapBlendshape(key);
      if (!morphName || dict[morphName] === undefined) continue;

      const i = dict[morphName];
      const current = influences[i] ?? 0;

      // slightly faster than before so expressions are visible
      influences[i] += (target - current) * 0.15;
    }
  });
}


  /* =========================
     FACE PROCEDURAL
  ========================= */
  updateFaceProcedural(delta) {
    if (this.bones.Head) {
    this.bones.Head.rotation.y += Math.sin(this.time * 0.6) * 0.002;
    this.bones.Head.rotation.x += Math.sin(this.time * 0.8) * 0.0015;
  }
    if (this.arousal > 0.5) {
  this.targetFaceState.mouth_open = 
    0.2 + Math.sin(this.time * 3) * 0.1;
}


    if (this.arousal > 0.5 && this.bone.Jaw) {
    this.bones.Jaw.rotation.x = 0.02 * Math.sin(this.time * 3);
  }
  }
  /* =========================
     BREATHING (BODY)
  ========================= */
  updateBreathing(delta) {
  const baseRate = 0.35;
  const baseAmp = 0.05;

  const rate = baseRate + this.arousal * 0.6;
  const amp  = baseAmp  + this.arousal * 0.03;

  const t = this.time * Math.PI * 2 * rate;
  const breath = Math.sin(t);

  if (this.bones.spine2) {
    this.bones.spine2.rotation.x = breath * amp;
  }
  if (this.bones.spine1) {
    this.bones.spine1.rotation.x = breath * amp * 0.5;
  }
}


}

