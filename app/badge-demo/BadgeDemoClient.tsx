"use client";

import { useEffect, useRef } from "react";
import type { Object3D } from "three";

export function BadgeDemoClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let animationId: number;

    const init = async () => {
      const THREE = await import("three");

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x2a2a2a);

      const container = containerRef.current!;
      const camera = new THREE.PerspectiveCamera(
        50,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 150);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      const canvas = renderer.domElement;
      canvas.style.display = "block";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      containerRef.current!.appendChild(canvas);

      scene.add(new THREE.AmbientLight(0xffffff, 0.5));

      const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
      mainLight.position.set(50, 80, 50);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 1024;
      mainLight.shadow.mapSize.height = 1024;
      mainLight.shadow.camera.near = 0.5;
      mainLight.shadow.camera.far = 200;
      mainLight.shadow.camera.left = -60;
      mainLight.shadow.camera.right = 60;
      mainLight.shadow.camera.top = 60;
      mainLight.shadow.camera.bottom = -60;
      mainLight.shadow.bias = -0.0001;
      scene.add(mainLight);

      const rimLight = new THREE.DirectionalLight(0x9ccfff, 0.4);
      rimLight.position.set(-30, 20, -50);
      scene.add(rimLight);

      const shadowCanvas = document.createElement("canvas");
      shadowCanvas.width = 512;
      shadowCanvas.height = 512;
      const shadowContext = shadowCanvas.getContext("2d");
      if (shadowContext) {
        const gradient = shadowContext.createRadialGradient(
          256,
          256,
          40,
          256,
          256,
          200
        );
        gradient.addColorStop(0, "rgba(0, 0, 0, 0.28)");
        gradient.addColorStop(0.45, "rgba(0, 0, 0, 0.12)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        shadowContext.fillStyle = gradient;
        shadowContext.fillRect(0, 0, 512, 512);
      }

      const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
      const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(120, 120),
        new THREE.MeshBasicMaterial({
          map: shadowTexture,
          transparent: true,
          depthWrite: false,
          opacity: 0.9,
        })
      );
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -46;
      shadowPlane.scale.set(1.2, 0.55, 1);
      scene.add(shadowPlane);

      let mesh: Object3D | null = null;

      const SVG_STRING = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 76C0 34.0264 34.0264 0 76 0H436C477.974 0 512 34.0264 512 76V436C512 477.974 477.974 512 436 512H76C34.0264 512 0 477.974 0 436V76Z" fill="#D9D9D9"/>
</svg>`;

      const { SVGLoader } = await import("three/examples/jsm/loaders/SVGLoader.js");
      const svgData = new SVGLoader().parse(SVG_STRING);
      const geometryGroup = new THREE.Group();

      const material = new THREE.MeshPhysicalMaterial({
        color: 0x9ccfff,
        roughness: 0.25,
        metalness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        side: THREE.DoubleSide,
      });

      const extrudeSettings = {
        depth: 30,
        bevelEnabled: false,
        curveSegments: 12,
      };

      for (let i = 0; i < svgData.paths.length; i++) {
        const path = svgData.paths[i];
        if (path.userData?.style?.fill === "none") continue;
        const shapes = SVGLoader.createShapes(path);
        for (let j = 0; j < shapes.length; j++) {
          const geometry = new THREE.ExtrudeGeometry(shapes[j], extrudeSettings);
          const meshPart = new THREE.Mesh(geometry, material);
          meshPart.castShadow = true;
          meshPart.receiveShadow = true;
          geometryGroup.add(meshPart);
        }
      }

      if (geometryGroup.children.length === 0) {
        const shape = new THREE.Shape();
        const r = 76;
        shape.moveTo(r, 0);
        shape.lineTo(512 - r, 0);
        shape.quadraticCurveTo(512, 0, 512, r);
        shape.lineTo(512, 512 - r);
        shape.quadraticCurveTo(512, 512, 512 - r, 512);
        shape.lineTo(r, 512);
        shape.quadraticCurveTo(0, 512, 0, 512 - r);
        shape.lineTo(0, r);
        shape.quadraticCurveTo(0, 0, r, 0);
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const meshPart = new THREE.Mesh(geometry, material);
        meshPart.castShadow = true;
        meshPart.receiveShadow = true;
        geometryGroup.add(meshPart);
      }

      const box = new THREE.Box3().setFromObject(geometryGroup);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetSize = 80;
      geometryGroup.scale.setScalar(targetSize / maxDim);

      // Center after scaling so the mesh does not end up off-screen.
      const scaledBox = new THREE.Box3().setFromObject(geometryGroup);
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
      geometryGroup.position.sub(scaledCenter);

      const tiltGroup = new THREE.Group();
      tiltGroup.rotation.set(-0.08, -0.42, 0.12);
      tiltGroup.add(geometryGroup);

      const spinGroup = new THREE.Group();
      spinGroup.add(tiltGroup);

      mesh = spinGroup;
      scene.add(spinGroup);

      function animate() {
        animationId = requestAnimationFrame(animate);
        if (mesh) {
          mesh.rotation.y += 0.002;
        }
        renderer.render(scene, camera);
      }
      animate();

      const onResize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        if (containerRef.current?.contains(renderer.domElement)) {
          containerRef.current.removeChild(renderer.domElement);
        }
      };
    };

    init().then((fn) => {
      cleanupRef.current = fn ?? null;
    });

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
      }}
    />
  );
}
