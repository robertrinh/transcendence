//* Option A: simple GIF
// import React from 'react';

// const ShowcasePanel: React.FC = () => {
// 	return (
// 		<div className="w-full h-full">
// 			<img
// 				src="/vintage.gif"
// 				alt="Pong gameplay"
// 				className="w-full h-full object-cover"
// 				/>
// 		</div>
// 	);
// };

//* Option B: Marquee Effect (+ Game of life background)
import React, { useRef, useEffect, useCallback } from 'react'; //* for the marquee effect

const COLORS = [
	'#00FFFF', //* Cyan
	'#FF00FF', //* Magenta
	'#00FF00', //* Lime
	'#FF6B6B', //* Coral
	'#9D4EDD', //* Purple
	'#FFE66D', //* Yellow
];

//* Game of Life grid
export const GameOfLifeBackground: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const gridRef = useRef<number[][]>([]);
	const colorsRef = useRef<string[][]>([]);
	const animationRef = useRef<number>();

	const CELL_SIZE = 12;
	const UPDATE_INTERVAL = 130; //* ms between generations

	//* init grid with random cells
	const initGrid = useCallback((cols: number, rows: number) => {
		const grid: number[][] = []; //* =[] to init the array
		const colors: string[][] = [];
		
		for (let i = 0; i < rows; i++) {
			grid[i] = [];
			colors[i] = [];
			for (let j = 0; j < cols; j++) {
				grid[i][j] = Math.random() > 0.80 ? 1 : 0; //* ~20% alive
				colors[i][j] = COLORS[Math.floor(Math.random() * COLORS.length)];
			}
		}
		
		gridRef.current = grid;
		colorsRef.current = colors;
	}, []);

	const countNeighbors = useCallback((grid: number[][], x: number, y: number, rows: number, cols: number) => {
		let count = 0;
		for (let i = -1; i <= 1; i++) 
		{
			for (let j = -1; j <= 1; j++) 
			{
				if (i === 0 && j === 0) 
					continue;
				const ni = (y + i + rows) % rows;
				const nj = (x + j + cols) % cols;
				count += grid[ni][nj];
			}
		}
		return count;
	}, []);

	const nextGeneration = useCallback(() => {
		const grid = gridRef.current;
		const colors = colorsRef.current;
		if (!grid.length) 
			return;

		const rows = grid.length;
		const cols = grid[0].length;
		const newGrid: number[][] = [];
		const newColors: string[][] = [];

		for (let i = 0; i < rows; i++) {
			newGrid[i] = [];
			newColors[i] = [];
			for (let j = 0; j < cols; j++) {
				const neighbors = countNeighbors(grid, j, i, rows, cols);
				const alive = grid[i][j];

				if (alive && (neighbors === 2 || neighbors === 3)) {
					newGrid[i][j] = 1;
					newColors[i][j] = colors[i][j];
				} else if (!alive && neighbors === 3) {
					newGrid[i][j] = 1;
					//* new cell gets random color
					newColors[i][j] = COLORS[Math.floor(Math.random() * COLORS.length)];
				} else {
					newGrid[i][j] = 0;
					newColors[i][j] = colors[i][j];
				}
			}
		}

		//* occasionally spawn new cells to keep it alive
		if (Math.random() > 0.7) {
			const iRandom = Math.floor(Math.random() * rows); 
			const jRandom = Math.floor(Math.random() * cols);
			newGrid[iRandom][jRandom] = 1;
			newColors[iRandom][jRandom] = COLORS[Math.floor(Math.random() * COLORS.length)];
		}

		gridRef.current = newGrid;
		colorsRef.current = newColors;
	}, [countNeighbors]);

	const draw = useCallback((ctx: CanvasRenderingContext2D) => {
		const grid = gridRef.current;
		const colors = colorsRef.current;
		if (!grid.length) 
			return;

		ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'; //* background colour
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		const rows = grid.length;
		const cols = grid[0].length;

		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				if (grid[i][j]) {
					ctx.beginPath();
					ctx.fillStyle = colors[i][j];
					ctx.shadowColor = colors[i][j];
					ctx.shadowBlur = 8;
					//* draw the cell as a circle
					ctx.arc(
						j * CELL_SIZE + CELL_SIZE / 2,
						i * CELL_SIZE + CELL_SIZE / 2,
						CELL_SIZE / 3,
						0,
						Math.PI * 2
					);
					ctx.fill();
					ctx.shadowBlur = 0;
				}
			}
		}
	}, []); 

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) 
			return;

		const ctx = canvas.getContext('2d');
		if (!ctx) 
			return;

		const resize = () => {
			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetHeight;
			const cols = Math.ceil(canvas.width / CELL_SIZE);
			const rows = Math.ceil(canvas.height / CELL_SIZE);
			initGrid(cols, rows);
		};

		resize();
		window.addEventListener('resize', resize);

		let lastUpdate = 0;
		const animate = (time: number) => {
			if (time - lastUpdate > UPDATE_INTERVAL) {
				nextGeneration();
				lastUpdate = time;
			}
			draw(ctx);
			animationRef.current = requestAnimationFrame(animate);
		};

		animationRef.current = requestAnimationFrame(animate);

		return () => {
			window.removeEventListener('resize', resize);
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [initGrid, nextGeneration, draw]);

	return (
		<canvas
			ref={canvasRef}
			className="absolute inset-0 w-full h-full opacity-80"
		/>
	);
};

interface MarqueeRowProps {
	items: string[];
	direction?: 'left' | 'right';
	speed?: number;
}

export const MarqueeRow: React.FC<MarqueeRowProps> = ({ 
	items, 
	direction = 'left', 
	speed = 25 
}) => {
	const animationClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';
	//* Duplicate items 4x to ensure full screen coverage
	const repeatedItems = [...items, ...items, ...items, ...items];
	
	return (
		<div className="w-full overflow-hidden">
			<div 
				className={`flex w-max ${animationClass}`} 
				style={{ animationDuration: `${speed}s` }}
			>
				{repeatedItems.map((item, i) => (
					<div 
						key={i} 
						className="flex-shrink-0 px-6 py-3 mx-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-white/90 font-medium whitespace-nowrap"
					>
						{item}
					</div>
				))}
			</div>
		</div>
	);
};

//* Main showcase panel
const ShowcasePanel: React.FC = () => {
	const row1 = ['Local Play', 'Tournament Mode', 'Online Functionalities', 'Leaderboards', 'AI Opponents'];
	const row2 = ['Customizable Avatars', 'Match History', 'Friend System', '2FA Security', 'GDPR Compliance'];
	const row3 = ['Classic Pong', 'Pls pass us', 'Fast Matches', 'Chat', 'Anonymous Mode'];

	return (
		<div className="relative w-full h-full overflow-hidden">
			<GameOfLifeBackground />
			
			{/* Dark gradient overlay for text readability */}
			<div 
				className="absolute inset-0 z-[5] pointer-events-none"
				style={{
					background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 25%, rgba(0,0,0,0.7) 40%, transparent 100%)'
				}}
			/>
			
			{/* Content overlay */}
			<div className="relative z-10 w-full h-full flex flex-col justify-center gap-6 py-8">
				<div className="text-center mb-8">
					<h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">Are you ready to be the best?</h2>
					<p className="text-white/70 text-lg drop-shadow">Show your skills and prove your worth.</p>
				</div>
				
				{/* Marquee rows */}
				<MarqueeRow items={row1} direction="left" speed={30} />
				<MarqueeRow items={row2} direction="right" speed={35} />
				<MarqueeRow items={row3} direction="left" speed={28} />
			</div>
		</div>
	);
};

export default ShowcasePanel;
