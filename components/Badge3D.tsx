"use client";

import { useEffect, useRef } from "react";

type Badge3DProps = {
  size?: number;
  className?: string;
  speed?: number;
  faceTextureSrc?: string;
  bodyColor?: string;
};

const SVG_STRING = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 76C0 34.0264 34.0264 0 76 0H436C477.974 0 512 34.0264 512 76V436C512 477.974 477.974 512 436 512H76C34.0264 512 0 477.974 0 436V76Z" fill="#D9D9D9"/>
</svg>`;

export function Badge3D({
  size = 80,
  className,
  speed = 0.002,
  faceTextureSrc = "/case-studies/ai-project-badge-totl-front.png",
  bodyColor = "#363636",
}: Badge3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.replaceChildren();

    let animationId = 0;
    let disposed = false;
    let renderer: import("three").WebGLRenderer | null = null;
    let cleanup: (() => void) | undefined;

    const init = async () => {
      const THREE = await import("three");
      const { SVGLoader } = await import("three/examples/jsm/loaders/SVGLoader.js");

      if (disposed) return;

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        42,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 180);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.setClearColor(0x000000, 0);

      const canvas = renderer.domElement;
      canvas.style.display = "block";
      canvas.style.width = "100%";
      canvas.style.height = "100%";

      if (disposed) {
        renderer.dispose();
        return;
      }

      container.appendChild(canvas);

      scene.add(new THREE.AmbientLight(0xffffff, 0.7));

      const mainLight = new THREE.DirectionalLight(0xffffff, 1.15);
      mainLight.position.set(70, 90, 80);
      scene.add(mainLight);

      const rimLight = new THREE.DirectionalLight(0xffffff, 0.55);
      rimLight.position.set(-40, 10, 50);
      scene.add(rimLight);

      const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
      fillLight.position.set(0, -30, 60);
      scene.add(fillLight);

      const shadowCanvas = document.createElement("canvas");
      shadowCanvas.width = 512;
      shadowCanvas.height = 512;
      const shadowContext = shadowCanvas.getContext("2d");

      if (shadowContext) {
        const gradient = shadowContext.createRadialGradient(
          256,
          256,
          34,
          256,
          256,
          190
        );
        gradient.addColorStop(0, "rgba(0, 0, 0, 0.22)");
        gradient.addColorStop(0.45, "rgba(0, 0, 0, 0.1)");
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
          opacity: 0.8,
        })
      );
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.set(0, -100, 0);
      shadowPlane.scale.set(1.15, 0.48, 1);
      scene.add(shadowPlane);

      const textureLoader = new THREE.TextureLoader();
      const faceTexture = await textureLoader.loadAsync(faceTextureSrc);
      faceTexture.colorSpace = THREE.SRGBColorSpace;
      faceTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      faceTexture.center.set(0.5, 0.5);
      faceTexture.rotation = Math.PI;

      const faceMaterial = new THREE.MeshPhysicalMaterial({
        map: faceTexture,
        roughness: 0.18,
        metalness: 0.02,
        clearcoat: 0.9,
        clearcoatRoughness: 0.18,
        side: THREE.DoubleSide,
      });

      const bodyMaterial = new THREE.MeshPhysicalMaterial({
        color: bodyColor,
        roughness: 0.2,
        metalness: 0.06,
        clearcoat: 1,
        clearcoatRoughness: 0.14,
        transmission: 0.08,
        thickness: 0.8,
        ior: 1.2,
        side: THREE.DoubleSide,
      });

      const svgData = new SVGLoader().parse(SVG_STRING);
      const geometryGroup = new THREE.Group();
      const extrudeSettings = {
        depth: 30,
        bevelEnabled: false,
        curveSegments: 12,
      };

      for (const path of svgData.paths) {
        if (path.userData?.style?.fill === "none") continue;

        const shapes = SVGLoader.createShapes(path);
        for (const shape of shapes) {
          const bodyGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
          const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
          geometryGroup.add(bodyMesh);

          const faceGeometry = new THREE.ShapeGeometry(shape, 12);
          faceGeometry.computeBoundingBox();

          const bounds = faceGeometry.boundingBox;
          const positions = faceGeometry.attributes.position;
          const uv = new Float32Array(positions.count * 2);

          if (bounds) {
            const width = bounds.max.x - bounds.min.x || 1;
            const height = bounds.max.y - bounds.min.y || 1;

            for (let index = 0; index < positions.count; index++) {
              const x = positions.getX(index);
              const y = positions.getY(index);
              uv[index * 2] = 1 - (x - bounds.min.x) / width;
              uv[index * 2 + 1] = 1 - (y - bounds.min.y) / height;
            }
          }

          faceGeometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));

          const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
          faceMesh.position.z = extrudeSettings.depth + 0.25;
          geometryGroup.add(faceMesh);
        }
      }

      if (geometryGroup.children.length === 0) return;

      const box = new THREE.Box3().setFromObject(geometryGroup);
      const maxDim = Math.max(...box.getSize(new THREE.Vector3()).toArray());
      geometryGroup.scale.setScalar(size / maxDim);

      const scaledBox = new THREE.Box3().setFromObject(geometryGroup);
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
      geometryGroup.position.sub(scaledCenter);

      const tiltGroup = new THREE.Group();
      tiltGroup.rotation.set(-0.08, -0.42, 0.12);
      tiltGroup.add(geometryGroup);

      const spinGroup = new THREE.Group();
      spinGroup.add(tiltGroup);
      scene.add(spinGroup);

      const onResize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer?.setSize(width, height);
      };

      window.addEventListener("resize", onResize);

      const animate = () => {
        animationId = requestAnimationFrame(animate);
        spinGroup.rotation.y += speed;
        renderer?.render(scene, camera);
      };

      animate();

      return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener("resize", onResize);
        shadowTexture.dispose();
        faceTexture.dispose();
        faceMaterial.dispose();
        bodyMaterial.dispose();
        geometryGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
          }
        });
        renderer?.dispose();
        if (container.contains(canvas)) {
          container.removeChild(canvas);
        }
      };
    };

    init().then((fn) => {
      if (disposed) {
        fn?.();
        return;
      }

      cleanup = fn;
    });

    return () => {
      disposed = true;
      cleanup?.();
      container.replaceChildren();
    };
  }, [bodyColor, faceTextureSrc, size, speed]);

  return <div ref={containerRef} className={className} />;
}
