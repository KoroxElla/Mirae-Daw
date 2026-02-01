console.log("🧠 Animator module loaded");

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";


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
    this.postureInstructions = [];
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
    console.log("🙂 Face meshes:", Object.keys(this.faceMeshes));
    console.group("🙂 FACE MESH + MORPH TARGETS");

    avatar.traverse((obj) => {
      if (obj.isSkinnedMesh && obj.morphTargetDictionary) {
        console.log("🧩 Mesh:", obj.name);
        console.log("➡ Morph targets:", Object.keys(obj.morphTargetDictionary));
      }
     });

console.groupEnd();

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
    this.updatePosture(delta);
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

    for (const [morph, target] of Object.entries(this.targetFaceState)) {
      if (dict[morph] === undefined) continue;

      influences[dict[morph]] += (target - influences[dict[morph]]) * 0.2;
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


    if (this.arousal > 0.5 && this.bones.Jaw) {
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


/* ============================
   PROCEDURAL INSTRUCTIONS
============================ */

  applyProceduralInstructions(proceduralInstructions) {
    proceduralInstructions.forEach((inst) => {
      if (inst.layer === "breathing" && inst.arousal !== undefined){
        this.arousal = inst.arousal;
      }
    });

  }

/* ===========================
   FACIAL INSTRUCTIONS
=========================== */

  applyFaceInstructions(faceInstructions) {
    faceInstructions.forEach(({ morph, value, weight }) => {
      if (value === undefined) return;

      const current = this.targetFaceState[morph] ?? 0;
      const w = weight ?? 1;

      this.targetFaceState[morph] = current * (1-w) + value *w;
    });
  }



/* =============================
   INSTRUCTIONS APPLICATION
============================ */

  applyInstructions(instructions) {
    if (instructions.bones) {
      this.postureInstructions = instructions.bones;
    }

    if (instructions.face) {
      this.applyFaceInstructions(instructions.face);
    }

    if (instructions.procedural) {
      this.applyProceduralInstructions(instructions.procedural);
    }
  }




/* ==============================
    POSTURE INSTRUCTIONS
============================== */

  updatePosture() {
    if (!this.postureInstructions.length) return;

    this.postureInstructions.forEach(({ bone, axis, value, weight }) => {
      const b = this.bones[bone];
      if (!b) return;

      const w = weight ?? 0.5;
      b.rotation[axis] += (value - b.rotation[axis]) * w;
    });
  }



}

