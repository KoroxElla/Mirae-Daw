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
    this.blink = {
      rate : 0.25,
      hold : 0.12,
      timer : 0,
      progress : 0,
      closing : false
    };
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
     UPDATE LOOP
  ========================= */
  update(delta) {
    this.time += delta;

    this.updateBreathing(delta);
    this.updateBlink(delta);
    this.updatePosture(delta);
    this.updateFaceMorphs(delta);
  }


  /* =============================
   INSTRUCTIONS APPLICATION
============================ */

  applyInstructions(instructions) {
    this.postureInstructions = instructions.bones || [];

    if (instructions.face) {
      instructions.face.forEach(({ morph, value }) => {
        this.targetFaceState[morph] = value;
      });
    }

    if (instructions.procedural) {
      this.applyProceduralInstructions(instructions.procedural);

      if (instructions.procedural.breathing) {
        this.breathing = instructions.procedural.breathing;
      }
    }
  }


  /* =========================
     FACE 
  ========================= */
  updateFaceMorphs(delta) {
  this.faceMeshes.forEach((mesh) => {
    const dict = mesh.morphTargetDictionary;
    const influences = mesh.morphTargetInfluences;

    for (const [morph, target] of Object.entries(this.targetFaceState)) {
      if (dict[morph] === undefined) continue;

      const i = dict[morph];
      const current = influences[i] ?? 0;

      influences[i] += (target - current) * 0.15;
    }
  });
}

/* ==============================
    POSTURE INSTRUCTIONS
============================== */

  updatePosture() {

    this.postureInstructions.forEach(({ bone, axis, value, weight }) => {
      const b = this.bones[bone];
      if (!b) return;

      const w = weight ?? 0.5;
      b.rotation[axis] += (value - b.rotation[axis]) * w;
    });
  }


  /* =========================
     BREATHING (BODY)
  ========================= */
  updateBreathing(delta) {

  const t = this.time * Math.PI * 2 * this.breathing.rate;
  const breath = Math.sin(t) * this.breathing.amplitude;

  if (this.bones.Spine2) {
    this.bones.Spine2.rotation.x = breath;
  }
  if (this.bones.Spine1) {
    this.bones.Spine1.rotation.x = breath * 0.5;
  }
}


  /* =============================
     BLINK 
  ============================= */

  updateBlink(delta) {
    const b = this.blink;

    b.timer += delta;

    const interval = 1 / b.rate;

    if (b.timer >= interval) {
      b.timer = 0;
      b.closing = true;
      b.progress = 0;
    }

    if (b.closing) {
      b.progress += delta / b.hold;

      const v = Math.min(b.progress, 1);

      this.targetFaceState.eyeBlinkLeft = v;
      this.targetFaceState.eyeBlinkRight = v;

      if (b.progress >= 1) {
      b.closing = false;
      }
    }
  }



/* ============================
   PROCEDURAL INSTRUCTIONS
============================ */

  applyProceduralInstructions(Instr) {
    Instr.forEach((inst) => {
      switch(inst.layer) {

        case "breathing":
          this.arousal = inst.arousal ?? this.arousal;
          break;

        case "blink":
          this.blink.rate = inst.rateMultiplier ?? this.blink.rate;
          this.blink.hold = inst.holdTime ?? this.blink.hold;
          break;
      }
    });

  }



}

