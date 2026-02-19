#!/usr/bin/env python3
"""
Diagnose VRM bone structure
Run this first to see actual bone names
"""

import json
import sys
import struct

def diagnose_vrm(vrm_path):
    print(f"\n🔍 Diagnosing VRM file: {vrm_path}")
    print("=" * 50)
    
    with open(vrm_path, 'rb') as f:
        # Read header
        header = f.read(12)
        magic, version, length = struct.unpack('<4sII', header)
        
        print(f"Magic: {magic.decode('utf-8')}")
        print(f"Version: {version}")
        
        # Read JSON chunk
        chunk_header = f.read(8)
        chunk_length, chunk_type = struct.unpack('<II', chunk_header)
        json_data = f.read(chunk_length)
        
        # Parse JSON
        json_str = json_data.decode('utf-8')
        gltf = json.loads(json_str)
        
        # Find all nodes that might be bones
        print("\n📋 ALL NODES:")
        print("-" * 50)
        
        bone_nodes = []
        
        for i, node in enumerate(gltf.get('nodes', [])):
            name = node.get('name', f'Node_{i}')
            has_mesh = 'mesh' in node
            has_children = 'children' in node
            has_skin = 'skin' in node
            
            is_bone = not has_mesh or has_skin
            
            print(f"\nNode {i}: {name}")
            print(f"   Has mesh: {has_mesh}")
            print(f"   Has children: {has_children}")
            print(f"   Has skin: {has_skin}")
            
            if is_bone:
                bone_nodes.append((i, name))
        
        # Check skins
        print("\n📋 SKINS:")
        print("-" * 50)
        for i, skin in enumerate(gltf.get('skins', [])):
            name = skin.get('name', f'Skin_{i}')
            joints = skin.get('joints', [])
            print(f"\nSkin {i}: {name}")
            print(f"   Joints: {len(joints)}")
            for j, joint_idx in enumerate(joints[:10]):  # Show first 10
                joint_name = gltf['nodes'][joint_idx].get('name', f'Node_{joint_idx}')
                print(f"      Joint {j}: Node {joint_idx} = {joint_name}")
            if len(joints) > 10:
                print(f"      ... and {len(joints) - 10} more")
        
        # Check for VRM extensions
        print("\n📋 VRM EXTENSIONS:")
        print("-" * 50)
        if 'extensions' in gltf and 'VRM' in gltf['extensions']:
            vrm = gltf['extensions']['VRM']
            if 'humanoid' in vrm:
                print("\nHumanoid bones from VRM:")
                for bone in vrm['humanoid'].get('humanBones', []):
                    bone_name = bone.get('bone', 'unknown')
                    node_index = bone.get('node', -1)
                    node_name = gltf['nodes'][node_index].get('name', f'Node_{node_index}') if node_index >= 0 else 'unknown'
                    print(f"   {bone_name}: Node {node_index} = {node_name}")
        
        # Summary
        print("\n" + "=" * 50)
        print(f"SUMMARY:")
        print(f"   Total nodes: {len(gltf.get('nodes', []))}")
        print(f"   Potential bones: {len(bone_nodes)}")
        print(f"   Skins: {len(gltf.get('skins', []))}")
        
        # List all bone names for manual mapping
        print("\n📋 ALL BONE NAMES FOR MAPPING:")
        print("-" * 50)
        for i, name in bone_nodes:
            print(f"{i}: {name}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python diagnose_vrm.py avatar.vrm")
        sys.exit(1)
    
    diagnose_vrm(sys.argv[1])
