export class MapperTranslator {
	//Constructor to store capability maps
	constructor(avatarProfile = {}) {
		this.boneMap = avatarProfile.bones || {};
		this.morphMap = avatarProfile.morphs || {};
	}


	
	translate(emotionPayload){
		const instructions = {
			procedural : [],
			bones : [],
			face : []
		};

		this.translateBreathing(emotionPayload, instructions);
		this.translatePosture(emotionPayload, instructions);
		this.translateFace(emotionPayload, instructions);

		return instructions;

	}

	/* =========================================
	   MULTI-EMOTION BLENDING
	   ===================================== */

	translateMultiple(emotionWeights){
		const final = {
			bones : [],
			face : [],
			procedural : []
		};

		const boneAccum = {};
		const faceAccum = {};
		let arousalSum = 0;
		let totalWeight = 0;

		Object.entries(emotionWeights).forEach(([emotion, weight]) => {
			const inst = this.translate({ emotion });

			totalWeigth += weight;

			/* --------BONES------------*/

			inst.bones.forEach(b => {
				const key = b.bone + "_" + b.axis;

				if (!boneAccum[key]) {
					boneAccum[key] = {...b, value : 0};
				}

				boneAccum[key].value += b.value * weight;
			});


			/* ----------FACE----------- */

			inst.face.forEach(f => {
            			if (!faceAccum[f.morph]) faceAccum[f.morph] = 0;
            			faceAccum[f.morph] += f.value * weight;
        		});

        		/* ---------- PROCEDURAL ---------- */
        		inst.procedural.forEach(p => {
            			if (p.layer === "breathing" && p.arousal !== undefined) {
                			arousalSum += p.arousal * weight;
            			}
        		});
    		});

    		/* normalize */
    		final.bones = Object.values(boneAccum);

    		final.face = Object.entries(faceAccum).map(([morph, value]) => ({
        		morph,
        		value
    		}));

    		if (totalWeight > 0) {
        		final.procedural.push({
            			layer: "breathing",
            			arousal: arousalSum / totalWeight
        		});
    		}

    		return final;
		
	}

	translateBreathing(emotionPayload,instructions) {
		if (emotionPayload.arousal === undefined) return;

		instructions.procedural.push({
			layer : "breathing",
			arousal : emotionPayload.arousal
		});
	}
	
	translatePosture(emotionPayload, instructions) {
		const posture = emotionPayload.posture;
		if (!posture) return ;

		const postures = Array.isArray(posture) ? posture : [posture];

		const addBone = (bone, axis, value, weight = 1) => {
			if(!this.boneMap[bone]) return;

			instructions.bones.push({
				bone,
				axis,
				value,
				weight
			});
		};

		postures.forEach((type) => {
			if (type === "upright") {
				addBone("Spine", "x", -0.05, 0.6);
				addBone("Spine1", "x", -0.03, 0.6);
				addBone('Spine2', 'x', -0.02, 0.6);
				addBone('Neck', 'x', 0.0, 0.5);
				addBone('Shoulder_L', 'z', -0.03, 0.4);
				addBone('Shoulder_R', 'z', -0.03, 0.4);

			}

			if (type === "slouched"){
				addBone("Spine",  "x", 0.12, 0.8);
				addBone("Spine1",  "x", 0.18, 0.8);
				addBone("Spine2", "x", 0.22, 0.8);
				addBone("Neck",   "x", 0.18, 0.6);
				addBone("LeftShoulder", "z", 0.66, 0.5);
				addBone("RightShoulder", "z", -0.66, 0.5);
			}

			if (type === "tense") {
				addBone("Shoulder_L", "y", 0.06, 0.7);
      				addBone("Shoulder_R", "y", 0.06, 0.7);
      				addBone("Neck", "x", -0.02, 0.5);
      				addBone("Spine2", "x", -0.01, 0.4);
			}

			if (type === "sad_arms"){
				// Slumb the shoulders inward
				addBone("LeftShoulder", "y", 2.25, 0.6);
  				addBone("RightShoulder", "y", -2.25, 0.6);

  				// Shoulders stay in front
  				addBone("LeftShoulder", "x", 0.18, 0.5);
  				addBone("RightShoulder", "x", -0.18, 0.5);

  				// Slight forward droop
  				addBone("LeftArm", "z", 1.62, 0.4);
  				addBone("RightArm", "z", -1.62, 0.4);

				addBone ("LeftArm",  "y", -0.22, 0.4);
  				addBone("RightArm", "y", 0.22, 0.4);

				addBone( "LeftForeArm", "x", -1.80, 0.4);
  				addBone("RightForeArm", "x", -1.80, 0.4);

				addBone("LeftForeArm", "z", -0.92, 0.4);
  				addBone("RightForeArm", "z", 0.92, 0.4);

				addBone("LeftForeArm", "y", 1.12, 0.4);
  				addBone("RightForeArm", "y", 1.12, 0.4);


			}
		});
	}

	translateFace(emotionPayload, instructions) {
		const emotion = emotionPayload.emotion;
  		if (!emotion) return;

  		const FACE_MAP = {
    			sadness: {
      				blendshapes: {
        				eyeSquintLeft: 1.65,
        				eyeSquintRight: 1.65,
					eyeLookDownLeft: 0.65,
					eyeLookDownRight: 0.65,
        				browInnerUp: 0.45,
					browDownLeft : 0.15,
					browDownRight: 0.15,
        				mouthFrownLeft: 0.85,
        				mouthFrownRight: 0.85,
        				mouthLowerDownLeft: 0.4,
        				mouthLowerDownRight: 0.4,
        				jawOpen: 0.04
      				},
      				blinking_mod: {
        				rate_multiplier: 0.7,
        				hold_time: 0.25
      				}
    			}
  		};

  		const config = FACE_MAP[emotion];
  		if (!config) return;

  		if (config.blendshapes) {
    			Object.entries(config.blendshapes).forEach(([key, value]) => {


      				instructions.face.push({
        				morph: key,
        				value,
        				weight: 1
      				});
    			});
  		}		

  		if (config.blinking_mod) {
    			instructions.procedural.push({
      				layer: "blink",
      				rateMultiplier: config.blinking_mod.rate_multiplier ?? 1,
      				holdTime: config.blinking_mod.hold_time ?? 0.12
    			});
  		}

  
	}
	




}



	

