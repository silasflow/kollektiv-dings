import { useEffect, useRef } from 'react';
import {
    AmbientLight,
    Box3,
    Color,
    Fog,
    DirectionalLight,
    Group,
    HemisphereLight,
    PerspectiveCamera,
    SRGBColorSpace,
    Scene,
    Vector3,
    WebGLRenderer,
} from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

const cityModelUrl = new URL('../../assets/models/3d_city_sample_terrain.glb', import.meta.url).href;

const cameraConfig = {
    fov: 40,
    distance: 20,
    height: 18,
    lookAtY: 30,
    mousePanX: 0.03,
    mousePanY: 0.03,
};

export default function BackgroundCity() {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const viewport = container;
        const mouseStart = { x: 0, y: 0, isSet: false };
        const pointer = { x: 0, y: 0 };

        const scene = new Scene();
        scene.background = new Color('#0B6B57');
        scene.fog = new Fog('#0B6B57', 9, 210);

        const camera = new PerspectiveCamera(cameraConfig.fov, 1, 0.1, 200);
        const baseCameraPosition = new Vector3(0, cameraConfig.height, cameraConfig.distance);
        camera.position.copy(baseCameraPosition);
        camera.lookAt(0, cameraConfig.lookAtY, 0);

        const renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.outputColorSpace = SRGBColorSpace;
        renderer.setClearColor(0x26103c, 0);
        container.appendChild(renderer.domElement);

        const ambientLight = new AmbientLight(0xf0fff6, 50.2);
        scene.add(ambientLight);

        const hemisphereLight = new HemisphereLight(0xd9fff0, 0x0b6b57, 50.8);
        scene.add(hemisphereLight);

        const keyLight = new DirectionalLight(0xecfff7, 120.5);
        keyLight.position.set(-40, 100, 50);
        scene.add(keyLight);

        const fillLight = new DirectionalLight(0x8ff8c9, 40.2);
        fillLight.position.set(-40, 100, -200);
        scene.add(fillLight);

        const modelGroup = new Group();
        modelGroup.scale.setScalar(3);
        scene.add(modelGroup);

        const loader = new GLTFLoader();

        let resizeObserver: ResizeObserver | null = null;
        let modelCenter = new Vector3(0, cameraConfig.lookAtY, 0);

        function resize() {
            const width = viewport.clientWidth || window.innerWidth;
            const height = viewport.clientHeight || window.innerHeight;

            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderScene();
        }

        function updateCamera() {
            const offsetX = pointer.x * cameraConfig.distance * cameraConfig.mousePanX;
            const offsetY = -pointer.y * cameraConfig.distance * cameraConfig.mousePanY;

            camera.position.set(
                modelCenter.x + offsetX,
                modelCenter.y + cameraConfig.height + offsetY,
                modelCenter.z + cameraConfig.distance
            );
            camera.lookAt(modelCenter);
        }

        function renderScene() {
            updateCamera();
            renderer.render(scene, camera);
        }

        function handleMouseMove(event: MouseEvent) {
            const width = window.innerWidth || 1;
            const height = viewport.clientHeight || window.innerHeight || 1;

            if (!mouseStart.isSet) {
                mouseStart.x = event.clientX;
                mouseStart.y = event.clientY;
                mouseStart.isSet = true;
            }

            pointer.x = ((event.clientX - mouseStart.x) / width) * 2;
            pointer.y = ((event.clientY - mouseStart.y) / height) * 2;

            renderScene();
        }

        loader.load(
            cityModelUrl,
            (gltf: GLTF) => {
                const model = gltf.scene;
                const box = new Box3().setFromObject(model);
                const size = box.getSize(new Vector3());
                const center = box.getCenter(new Vector3());

                model.position.x = -center.x;
                model.position.y = -center.y;
                model.position.z = -center.z;

                const maxDimension = Math.max(size.x, size.y, size.z);
                const targetScale = maxDimension > 0 ? 42 / maxDimension : 1;
                model.scale.setScalar(targetScale);
                model.rotation.y = -3.35;
                model.position.y -= size.y * targetScale * 0.2;

                modelGroup.add(model);

                const fittedBox = new Box3().setFromObject(modelGroup);
                modelCenter = fittedBox.getCenter(new Vector3());

                renderScene();
            },
            undefined,
            (error: unknown) => {
                console.error('Failed to load city terrain model', error);
            }
        );

        window.addEventListener('resize', resize);
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(viewport);

        window.addEventListener('mousemove', handleMouseMove);

        resize();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            resizeObserver?.disconnect();
            renderer.dispose();

            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '80svh',
                zIndex: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
                opacity: 0.7,
            }}
            aria-hidden="true"
        >
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: '30%',
                    background: 'linear-gradient(to bottom, rgba(11, 107, 87, 0), #004C43)',
                    zIndex: 1,
                }}
            />
        </div>
    );
}
