"use strict;"

import { PVector, Node, Renderer, Graph } from './Simulation.mjs';

// Setup
const statsDOM = document.getElementById('stats');
const canvasDOM = document.getElementById('canvas');
canvasDOM.width = window.innerWidth;
canvasDOM.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const graph = new Graph();
const renderer = new Renderer(ctx, canvasDOM.width, canvasDOM.height, graph);
console.log(renderer);

// Generate sample Nodes
const generateNodes = (nodes) => {
	console.log("main.js: generate nodes..")
	for(const node of nodes){
		const x = Math.floor(Math.random() * canvasDOM.width * 20 - canvasDOM.width * 10);
		const y = Math.floor(Math.random() * canvasDOM.height * 20 - canvasDOM.width * 10);
		const r = 30;

		const _node = new Node(node.path, node.name, node.links, x, y, r, "#034752");
		graph.add(_node);
	}
}

(() => {
	$.ajax({
		url: "json/graph.json",
		dataType: "json",
		success: (res) => {
			console.log(res);
			generateNodes(res);
			update();
		}
	});
})();

let lastUpdate = Date.now();
let c = 0;
const update = () => {

	const now = Date.now();
	const dt = now - lastUpdate;
	lastUpdate = now;

	if(c == 5){
		c = 0;
		const stats = graph.getStats();

		const fps   = Math.floor(1000 / dt);
		const avgX  = (stats.x).toFixed(2);
		const avgY  = (stats.y).toFixed(2);
		const n     = (stats.n);
		const scale = (stats.scale).toFixed(2);
	
		statsDOM.innerHTML = `fps: ${ fps } <br>
			avg vel_x: ${ avgX }; avg vel_y: ${ avgY } <br>
			nodes: ${ n } <br>
			scale: ${ scale } <br>
			`;
	}

	graph.calculateForces();
	renderer.updateMouse();
	renderer.draw();

	c++;
	window.requestAnimationFrame(update);
}
