import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Raycaster, Vector2 } from 'three';
import axios from 'axios';


interface Transaction {
  _id: string;
  pair: string | null;
  amount_in: number | null;
  amount_out: number | null;
  hash: string | null;
  is_buy: boolean | null;
  timestamp: number;
}

interface GalaxyLine {
  line: THREE.Line;
  points: THREE.Vector3[];
  speed: number;
  angle: number;
  radius: number;
  wiggle: number;
  color: THREE.Color;
  transaction: Transaction;
}



export function SpaceScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredTransaction, setHoveredTransaction] = useState<Transaction | null>(null);
  //const [latestTsxTs, setLatestTsxTs] = useState<number | null>(null);
  
  

  useEffect(() => {

    var latestTsxTs: number | null = null;
    async function fetchTransactionData() {
      try {
        if(latestTsxTs){
          const response = await axios.get('https://fractal-ai.vercel.app/api/data?date=' + latestTsxTs);
          const data = response.data;
          return data;
        }else{
          const response = await axios.get('https://fractal-ai.vercel.app/api/data');
          const data = response.data;
          return data;
        }
      } catch (error) {
        console.error('Error fetching transaction data:', error);
      }
    }
    
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Center raycaster with increased threshold
    const raycaster = new Raycaster();
    raycaster.params.Line!.threshold = 0.5;
    const centerPoint = new Vector2(0, 0);

    // Stars background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.1 });
    
    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Galaxy lines
    const lines: GalaxyLine[] = [];
    const MAX_LINES = 200;
    const MAX_POINTS = 500;

    
    function createLine(transaction: Transaction){
      const points: THREE.Vector3[] = [];
      const radius = 2 + Math.random() * 15;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.001 + (Math.random() * 0.002);
      const wiggle = Math.random() * 0.2;

      const color = new THREE.Color(
        transaction.is_buy === true ? 0.2 : 0.8, 0.3 + Math.random() * 0.4, transaction.is_buy === true ? 0.8 : 0.2
      );

      const geometry = new THREE.BufferGeometry();
      const material = new THREE.LineBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.6,
        linewidth: 2
      });

      const line = new THREE.Line(geometry, material);
      scene.add(line);

      return {
        line,
        points,
        speed,
        angle,
        radius,
        wiggle,
        color,
        transaction
      };

    }

    const PAIRS = ['FRAI → SOL', 'SOL → FRAI', 'OTHER'];

    async function initTransactions() {
      const tsx_data = await fetchTransactionData();
      if(tsx_data.data.length > 0) {
        latestTsxTs = tsx_data.data[tsx_data.data.length - 1].timestamp
        tsx_data.data.forEach((tsx: Transaction) => {
          if(tsx.is_buy === true){
            tsx['pair'] = PAIRS[1];
          }else if(tsx.is_buy === false){
            tsx['pair'] = PAIRS[0];
          }else{
            tsx['pair'] = PAIRS[2];
          }
          lines.push(createLine(tsx));
        })
      }
    }

    // Camera position
    camera.position.z = 20;
    camera.position.y = 10;
    camera.lookAt(0, 0, 0);

    // Movement variables
    const moveState = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      mouseX: 0,
      mouseY: 0,
      isLocked: false
    };

    // Movement speed
    const MOVE_SPEED = 0.1;
    const LOOK_SPEED = 0.002;

    // Mouse movement handler
    const onMouseMove = (event: MouseEvent) => {
      if (moveState.isLocked) {
        moveState.mouseX -= event.movementX * LOOK_SPEED;
        moveState.mouseY -= event.movementY * LOOK_SPEED;
        moveState.mouseY = Math.max(-Math.PI/2, Math.min(Math.PI/2, moveState.mouseY));
        
        camera.rotation.order = 'YXZ';
        camera.rotation.y = moveState.mouseX;
        camera.rotation.x = moveState.mouseY;
      }
    };

    // Pointer lock setup
    const canvas = renderer.domElement;
    canvas.addEventListener('click', () => {
      if (!moveState.isLocked) {
        canvas.requestPointerLock();
      }else{
        raycaster.setFromCamera(centerPoint, camera);
        const intersects = raycaster.intersectObjects(lines.map(l => l.line));
        if (intersects.length > 0 && intersects[0].distance < 50) {
          const intersectedLine = lines.find(l => l.line === intersects[0].object);
          if (intersectedLine) {
            window.open('https://solscan.io/tx/' + intersectedLine.transaction.hash, '_blank');
          }
        }
      }
      
    });

    document.addEventListener('pointerlockchange', () => {
      moveState.isLocked = document.pointerLockElement === canvas;
    });

    // Keyboard controls
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW': moveState.forward = true; break;
        case 'KeyS': moveState.backward = true; break;
        case 'KeyA': moveState.left = true; break;
        case 'KeyD': moveState.right = true; break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW': moveState.forward = false; break;
        case 'KeyS': moveState.backward = false; break;
        case 'KeyA': moveState.left = false; break;
        case 'KeyD': moveState.right = false; break;
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    initTransactions();

    // Line generation interval
    const lineInterval = setInterval(() => {
      initTransactions();
    }, 5000);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Update lines
      lines.forEach(line => {
        line.angle += line.speed;
        
        const x = Math.cos(line.angle) * line.radius;
        const z = Math.sin(line.angle) * line.radius;
        const y = Math.sin(line.angle * 3) * line.wiggle;
        
        line.points.push(new THREE.Vector3(x, y, z));
        
        if (line.points.length > MAX_POINTS) {
          line.points.shift();
        }
        
        const positions = new Float32Array(line.points.flatMap(p => [p.x, p.y, p.z]));
        line.line.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        line.line.geometry.computeBoundingSphere();
      });

      // Center raycasting
      raycaster.setFromCamera(centerPoint, camera);
      const intersects = raycaster.intersectObjects(lines.map(l => l.line));
      
      if (intersects.length > 0 && intersects[0].distance < 50) {
        const intersectedLine = lines.find(l => l.line === intersects[0].object);
        if (intersectedLine) {
          setHoveredTransaction(intersectedLine.transaction);
          intersectedLine.line.material.opacity = 1;
        }
      } else {
        setHoveredTransaction(null);
        lines.forEach(line => {
          line.line.material.opacity = 0.6;
        });
      }

      // Movement
      if (moveState.isLocked) {
        const direction = new THREE.Vector3();
        const rotation = camera.rotation.clone();
        
        if (moveState.forward) direction.z -= 1;
        if (moveState.backward) direction.z += 1;
        if (moveState.left) direction.x -= 1;
        if (moveState.right) direction.x += 1;

        direction.normalize();
        direction.applyEuler(new THREE.Euler(0, rotation.y, 0));
        camera.position.addScaledVector(direction, MOVE_SPEED);
      }

      renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      clearInterval(lineInterval);
      containerRef.current?.removeChild(renderer.domElement);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="fixed inset-0" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full pointer-events-none" />
      {hoveredTransaction && (
        <div className="fixed bottom-4 left-4 bg-zinc-900/90 backdrop-blur-sm p-4 rounded-lg text-sm space-y-1">
          <div className={`font-semibold ${
            hoveredTransaction.is_buy === false ? 'text-red-500' : hoveredTransaction.is_buy === null ? 'text-gray-500' : 'text-green-500'
          }`}>
            {hoveredTransaction.is_buy === true ? 'BUY' : hoveredTransaction.is_buy === null ? 'OTHER' : 'SELL'}
          </div>
          <div className="text-gray-400">{new Date(hoveredTransaction.timestamp * 1000).toLocaleString()}</div>
          <div>
            <span className="text-gray-400">Pair</span>
            <span className="float-right ml-8">{hoveredTransaction.pair}</span>
          </div>
          <div>
            <span className="text-gray-400">From</span>
            {hoveredTransaction.is_buy === true ? (
              <span className="float-right ml-8">{hoveredTransaction.amount_in?.toFixed(2) || ''} {hoveredTransaction.amount_in ===null ? '-' : 'SOL'}</span>
            ) : (
              <span className="float-right ml-8">{hoveredTransaction.amount_in?.toFixed(2) || ''} {hoveredTransaction.amount_in ===null ? '-' : 'FRAI'}</span>
            ) }
          </div>
          <div>
            <span className="text-gray-400">To</span>
            {hoveredTransaction.is_buy === true ? (
              <span className="float-right ml-8">{hoveredTransaction.amount_out?.toFixed(2) || ''} {hoveredTransaction.amount_out ===null ? '-' : 'FRAI'}</span>
            ) : (
              <span className="float-right ml-8">{hoveredTransaction.amount_out?.toFixed(2) || ''} {hoveredTransaction.amount_out ===null ? '-' : 'SOL'}</span>
            ) }
          </div>
          <button className="w-full mt-2 py-1 px-2 bg-zinc-800 hover:bg-zinc-700 rounded text-center text-xs">
            Click to view on Solscan
          </button>
        </div>
      )}
    </>
  );
}
