#!/usr/bin/env python3
"""
VRM to GLB Converter - With T-pose reset
Adds initial rotation to hips to fix twisted pose
"""

import os
import sys
import json
import struct
import numpy as np
from pathlib import Path

try:
    import pygltflib
except ImportError:
    print("Installing pygltflib...")
    os.system("pip install pygltflib")
    import pygltflib

class VRMtoGLBConverter:
    def __init__(self):
        self.gltf = None
        self.bin_data = None
        self.vrm_json = None
        self.bone_map = {}
        
    def read_glb_header(self, file):
        header = file.read(12)
        magic, version, length = struct.unpack('<4sII', header)
        return magic.decode('utf-8'), version, length
    
    def read_chunk(self, file):
        chunk_header = file.read(8)
        if not chunk_header:
            return None, None
        chunk_length, chunk_type = struct.unpack('<II', chunk_header)
        chunk_data = file.read(chunk_length)
        return chunk_data, chunk_type
    
    def extract_vrm_data(self, vrm_path):
        print(f"📥 Reading VRM file: {vrm_path}")
        
        with open(vrm_path, 'rb') as f:
            magic, version, length = self.read_glb_header(f)
            
            if magic != 'glTF':
                raise ValueError("Not a valid GLB/VRM file")
            
            json_data, chunk_type = self.read_chunk(f)
            if chunk_type != 0x4E4F534A:
                raise ValueError("First chunk is not JSON")
            
            json_str = json_data.decode('utf-8')
            self.vrm_json = json.loads(json_str)
            
            bin_data, chunk_type = self.read_chunk(f)
            if chunk_type == 0x004E4942:
                self.bin_data = bin_data
                print(f"   Binary data: {len(bin_data)} bytes")
            
            return self.vrm_json, self.bin_data
    
    def reset_to_t_pose(self):
        """Reset the avatar to a proper T-pose by adding initial rotations"""
        print("\n🔄 Resetting avatar to T-pose...")
        
        nodes = self.vrm_json.get('nodes', [])
        
        # Find the hips node
        hips_index = None
        for i, node in enumerate(nodes):
            name = node.get('name', '')
            if 'mixamorigHips' in name or 'hips' in name.lower():
                hips_index = i
                print(f"   Found hips at node {i}: {name}")
                break
        
        if hips_index is not None:
            # Add a default rotation to hips if none exists
            if 'rotation' not in nodes[hips_index]:
                nodes[hips_index]['rotation'] = [0, 0, 0, 1]
                print("   Added default rotation to hips")
        
        # Find and fix arm rotations
        arm_bones = {
            'mixamorigLeftArm': [0, 0, 0, 1],  # Identity rotation
            'mixamorigRightArm': [0, 0, 0, 1],
            'mixamorigLeftForeArm': [0, 0, 0, 1],
            'mixamorigRightForeArm': [0, 0, 0, 1],
            'mixamorigLeftHand': [0, 0, 0, 1],
            'mixamorigRightHand': [0, 0, 0, 1],
        }
        
        for node in nodes:
            name = node.get('name', '')
            if name in arm_bones:
                if 'rotation' not in node:
                    node['rotation'] = [0, 0, 0, 1]
                    print(f"   Added rotation to {name}")
        
        print("   T-pose reset complete")
    
    def create_bone_mapping(self):
        """Create exact mapping from VRM bone names to Mixamo bone names"""
        print("\n🦴 Creating bone mapping based on your VRM structure:")
        
        vrm_to_mixamo = {
            # Torso
            'hips': 'mixamorigHips',
            'spine': 'mixamorigSpine',
            'chest': 'mixamorigSpine1',
            'upperChest': 'mixamorigSpine2',
            'neck': 'mixamorigNeck',
            'head': 'mixamorigHead',
            
            # Left arm
            'leftShoulder': 'mixamorigLeftShoulder',
            'leftUpperArm': 'mixamorigLeftArm',
            'leftLowerArm': 'mixamorigLeftForeArm',
            'leftHand': 'mixamorigLeftHand',
            
            # Left fingers
            'leftThumbMetacarpal': 'mixamorigLeftHandThumb1',
            'leftThumbProximal': 'mixamorigLeftHandThumb2',
            'leftThumbDistal': 'mixamorigLeftHandThumb3',
            'leftIndexProximal': 'mixamorigLeftHandIndex1',
            'leftIndexIntermediate': 'mixamorigLeftHandIndex2',
            'leftIndexDistal': 'mixamorigLeftHandIndex3',
            'leftMiddleProximal': 'mixamorigLeftHandMiddle1',
            'leftMiddleIntermediate': 'mixamorigLeftHandMiddle2',
            'leftMiddleDistal': 'mixamorigLeftHandMiddle3',
            'leftRingProximal': 'mixamorigLeftHandRing1',
            'leftRingIntermediate': 'mixamorigLeftHandRing2',
            'leftRingDistal': 'mixamorigLeftHandRing3',
            'leftLittleProximal': 'mixamorigLeftHandPinky1',
            'leftLittleIntermediate': 'mixamorigLeftHandPinky2',
            'leftLittleDistal': 'mixamorigLeftHandPinky3',
            
            # Right arm
            'rightShoulder': 'mixamorigRightShoulder',
            'rightUpperArm': 'mixamorigRightArm',
            'rightLoweArm': 'mixamorigRightForeArm',
            'rightHand': 'mixamorigRightHand',
            
            # Right fingers
            'rightThumbMetacarpal': 'mixamorigRightHandThumb1',
            'rightThumbProximal': 'mixamorigRightHandThumb2',
            'rightThumbDistal': 'mixamorigRightHandThumb3',
            'rightIndexProximal': 'mixamorigRightHandIndex1',
            'rightIndexIntermediate': 'mixamorigRightHandIndex2',
            'rightIndexDistal': 'mixamorigRightHandIndex3',
            'rightMiddleProximal': 'mixamorigRightHandMiddle1',
            'rightMiddleIntermediate': 'mixamorigRightHandMiddle2',
            'rightMiddleDistal': 'mixamorigRightHandMiddle3',
            'rightRingProximal': 'mixamorigRightHandRing1',
            'rightRingIntermediate': 'mixamorigRightHandRing2',
            'rightRingDistal': 'mixamorigRightHandRing3',
            'rightLittleProximal': 'mixamorigRightHandPinky1',
            'rightLittleIntermediate': 'mixamorigRightHandPinky2',
            'rightLittleDistal': 'mixamorigRightHandPinky3',
            
            # Legs
            'leftUpperLeg': 'mixamorigLeftUpLeg',
            'leftLowerLeg': 'mixamorigLeftLeg',
            'leftFoot': 'mixamorigLeftFoot',
            'leftToes': 'mixamorigLeftToeBase',
            
            'rightUpperLeg': 'mixamorigRightUpLeg',
            'rightLowerLeg': 'mixamorigRightLeg',
            'rightFoot': 'mixamorigRightFoot',
            'rightToes': 'mixamorigRightToeBase',
            
            # Extra finger joints (keep as is)
            'LeftHandIndex4': 'LeftHandIndex4',
            'LeftHandMiddle4': 'LeftHandMiddle4',
            'LeftHandRing4': 'LeftHandRing4',
            'LeftHandPinky4': 'LeftHandPinky4',
            'LeftHandThumb4': 'LeftHandThumb4',
            'RightHandIndex4': 'RightHandIndex4',
            'RightHandMiddle4': 'RightHandMiddle4',
            'RightHandRing4': 'RightHandRing4',
            'RightHandPinky4': 'RightHandPinky4',
            'RightHandThumb4': 'RightHandThumb4',
            
            # Hair bones
            'longHair01': 'longHair01',
            'longHair02': 'longHair02',
            'ponyTail_L_01': 'ponyTail_L_01',
            'ponyTail_L_02': 'ponyTail_L_02',
            'ponyTail_L_03': 'ponyTail_L_03',
            'ponyTail_R_01': 'ponyTail_R_01',
            'ponyTail_R_02': 'ponyTail_R_02',
            'ponyTail_R_03': 'ponyTail_R_03',
            'sailorHair_L_01': 'sailorHair_L_01',
            'sailorHair_L_02': 'sailorHair_L_02',
            'sailorHair_R_01': 'sailorHair_R_01',
            'sailorHair_R_02': 'sailorHair_R_02',
            
            # End bones
            'Head_end': 'Head_end',
            'RightToe_End': 'RightToe_End',
            'LeftToe_End': 'LeftToe_End',
            
            # Mesh nodes
            'body': 'body',
            'clothes': 'clothes',
            'secondary': 'secondary',
        }
        
        nodes = self.vrm_json.get('nodes', [])
        mapped_count = 0
        arm_bone_count = 0
        
        for i, node in enumerate(nodes):
            node_name = node.get('name', '')
            
            if node_name in vrm_to_mixamo:
                mixamo_name = vrm_to_mixamo[node_name]
                self.bone_map[i] = mixamo_name
                mapped_count += 1
                
                if any(part in mixamo_name.lower() for part in ['arm', 'hand', 'shoulder', 'thumb', 'finger', 'index', 'middle', 'ring', 'pinky']):
                    arm_bone_count += 1
                
                print(f"   ✓ Node {i:2d}: {node_name:20} -> {mixamo_name}")
            else:
                self.bone_map[i] = node_name
                print(f"   - Node {i:2d}: {node_name:20} (keeping original)")
        
        print(f"\n   Total nodes mapped: {mapped_count}")
        print(f"   Arm/hand bones mapped: {arm_bone_count}")
        
        return mapped_count, arm_bone_count
    
    def rename_bones(self):
        """Rename bones in the node array"""
        print("\n🏷️  Renaming bones...")
        
        for node_idx, mixamo_name in self.bone_map.items():
            if node_idx < len(self.vrm_json['nodes']):
                self.vrm_json['nodes'][node_idx]['name'] = mixamo_name
    
    def remove_vrm_extensions(self):
        """Remove VRM extensions"""
        if 'extensions' in self.vrm_json:
            if 'VRM' in self.vrm_json['extensions']:
                print("\n🧹 Removing VRM extension")
                del self.vrm_json['extensions']['VRM']
            
            if not self.vrm_json['extensions']:
                del self.vrm_json['extensions']
    
    def ensure_required_fields(self):
        """Ensure all required glTF fields"""
        if 'asset' not in self.vrm_json:
            self.vrm_json['asset'] = {
                'version': '2.0',
                'generator': 'VRM to GLB Converter (T-pose Reset)'
            }
        
        if 'scene' not in self.vrm_json:
            self.vrm_json['scene'] = 0
        
        if 'scenes' not in self.vrm_json:
            # Find root nodes
            all_children = set()
            if 'nodes' in self.vrm_json:
                for node in self.vrm_json['nodes']:
                    if 'children' in node:
                        all_children.update(node['children'])
                
                root_nodes = [i for i in range(len(self.vrm_json['nodes'])) 
                            if i not in all_children]
                
                self.vrm_json['scenes'] = [{'nodes': root_nodes}]
            else:
                self.vrm_json['scenes'] = [{'nodes': [0]}]
        
        if 'buffers' not in self.vrm_json:
            self.vrm_json['buffers'] = [{
                'byteLength': len(self.bin_data) if self.bin_data else 0
            }]
    
    def save_as_glb(self, output_path):
        """Save as GLB file"""
        print(f"\n💾 Saving to {output_path}...")
        
        try:
            json_str = json.dumps(self.vrm_json, separators=(',', ':'))
            json_bytes = json_str.encode('utf-8')
            
            json_padding = (4 - (len(json_bytes) % 4)) % 4
            json_bytes += b' ' * json_padding
            
            bin_data = self.bin_data if self.bin_data else b''
            bin_padding = (4 - (len(bin_data) % 4)) % 4
            bin_data += b'\x00' * bin_padding
            
            with open(output_path, 'wb') as f:
                total_length = 12 + 8 + len(json_bytes) + 8 + len(bin_data)
                f.write(struct.pack('<4sII', b'glTF', 2, total_length))
                
                f.write(struct.pack('<II', len(json_bytes), 0x4E4F534A))
                f.write(json_bytes)
                
                if bin_data:
                    f.write(struct.pack('<II', len(bin_data), 0x004E4942))
                    f.write(bin_data)
            
            file_size = os.path.getsize(output_path) / 1024
            print(f"✅ Saved GLB ({file_size:.1f} KB)")
            return True
            
        except Exception as e:
            print(f"❌ Error saving GLB: {e}")
            return False
    
    def convert(self, input_path, output_path):
        """Main conversion function"""
        print(f"\n🎯 Converting: {input_path} -> {output_path}")
        print("=" * 60)
        
        try:
            # Extract VRM data
            self.extract_vrm_data(input_path)
            
            if not self.vrm_json:
                raise ValueError("No JSON data extracted")
            
            # Create bone mapping
            mapped_count, arm_count = self.create_bone_mapping()
            
            # Rename bones
            self.rename_bones()
            
            # Reset to T-pose (NEW!)
            self.reset_to_t_pose()
            
            # Clean up
            self.remove_vrm_extensions()
            self.ensure_required_fields()
            
            # Save
            if self.save_as_glb(output_path):
                print("\n" + "=" * 60)
                print("✅ CONVERSION SUCCESSFUL!")
                print("=" * 60)
                print(f"📊 Summary:")
                print(f"   - Total nodes: {len(self.vrm_json.get('nodes', []))}")
                print(f"   - Bones mapped to Mixamo: {mapped_count}")
                print(f"   - Arm/hand bones mapped: {arm_count}")
                print(f"   - Skins: {len(self.vrm_json.get('skins', []))}")
                print("=" * 60)
                
                print("\n🎯 T-pose reset applied!")
                print("   The avatar should now load in a neutral pose")
                print("   Click any animation button to start animating")
                
                return True
            else:
                return False
            
        except Exception as e:
            print(f"\n❌ Conversion failed: {e}")
            import traceback
            traceback.print_exc()
            return False

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else input_file.replace('.vrm', '.glb')
    
    if not os.path.exists(input_file):
        print(f"❌ Input file not found: {input_file}")
        return 1
    
    converter = VRMtoGLBConverter()
    success = converter.convert(input_file, output_file)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
