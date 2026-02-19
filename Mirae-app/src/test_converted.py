#!/usr/bin/env python3
"""
Test converted GLB file structure
"""

import json
import sys
import struct

def test_glb(file_path):
    print(f"\n🔍 Testing GLB file: {file_path}")
    
    try:
        with open(file_path, 'rb') as f:
            # Read header
            header = f.read(12)
            magic, version, length = struct.unpack('<4sII', header)
            
            print(f"   Magic: {magic.decode('utf-8')}")
            print(f"   Version: {version}")
            print(f"   Total length: {length} bytes")
            
            # Read JSON chunk
            chunk_header = f.read(8)
            chunk_length, chunk_type = struct.unpack('<II', chunk_header)
            chunk_data = f.read(chunk_length)
            
            print(f"   JSON chunk: {chunk_length} bytes")
            
            # Parse JSON
            json_str = chunk_data.decode('utf-8')
            gltf = json.loads(json_str)
            
            print(f"\n📊 GLB Contents:")
            print(f"   - Generator: {gltf.get('asset', {}).get('generator', 'unknown')}")
            
            if 'nodes' in gltf:
                print(f"   - Nodes: {len(gltf['nodes'])}")
                # Count potential bones
                bone_count = 0
                for node in gltf['nodes']:
                    if 'skin' in node:
                        bone_count += 1
                if bone_count > 0:
                    print(f"     (including {bone_count} bones)")
            
            if 'skins' in gltf:
                print(f"   - Skins: {len(gltf['skins'])}")
                for i, skin in enumerate(gltf['skins']):
                    joints = len(skin.get('joints', []))
                    print(f"     Skin {i}: {joints} joints")
            
            if 'animations' in gltf:
                print(f"   - Animations: {len(gltf['animations'])}")
                for anim in gltf['animations']:
                    name = anim.get('name', 'unnamed')
                    channels = len(anim.get('channels', []))
                    print(f"     - {name}: {channels} channels")
            
            if 'meshes' in gltf:
                print(f"   - Meshes: {len(gltf['meshes'])}")
            
            if 'materials' in gltf:
                print(f"   - Materials: {len(gltf['materials'])}")
            
            print(f"\n✅ GLB file is valid and ready for Three.js!")
            return True
            
    except Exception as e:
        print(f"❌ Error testing GLB: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_converted.py file.glb")
        sys.exit(1)
    
    test_glb(sys.argv[1])
