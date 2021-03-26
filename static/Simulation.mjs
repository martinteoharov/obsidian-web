"use strict;"

const canvasDOM = document.getElementById('canvas');

class PVector {
	x = null;
	y = null;

	constructor(x, y){
		this.x = x;
		this.y = y;
	}

	static dist(v1, v2){
		const dX = v1.x - v2.x;
		const dY = v1.y - v2.y;

		return Math.sqrt(dX * dX + dY * dY);
	}

	add(vec){
		if(isNaN(vec.x) || isNaN(vec.y)) return;

		this.x += vec.x;
		this.y += vec.y;
		return this;
	}

	sub(vec){
		if(isNaN(vec.x) || isNaN(vec.y)) return;

		this.x -= vec.x;
		this.y -= vec.y;
		return this;
	}

	mult(scale){
		if(isNaN(scale)) return;

		this.x *= scale;
		this.y *= scale;

		return this;
	}

	length(){
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	normalize(){
		const len = this.length();
		this.x /= len;
		this.y /= len;
		return this;
	}
}


class Graph {
	static G = 0.000000001; // converge force
	static K = 0.5; // repell force

	nodes = [];

	add(node) {
		this.nodes.push(node);
	}

	findNodeByPath(path) {
		for(const node of this.nodes){
			if(node.path === path) return node
		}
	}

	calculateForces(){
		for(const node of this.nodes) {
			node.vel.mult(0);
		}

		// make nodes converge if connected
		for(const node of this.nodes) {
			const neighbours = node.links.map(l => this.findNodeByPath(l));

			for(const nei of neighbours) {
				const dist = PVector.dist(node.pos, nei.pos);
				const neiPosCopy = new PVector(nei.pos.x, nei.pos.y);

				const force = neiPosCopy.sub(node.pos).normalize(); // normalizealized, |force| = 1
				force.mult(Graph.G * node.weight * nei.weight * (dist*dist));

				node.vel.add(force);
			}
		}

		// make nodes repell each other
		for(const A of this.nodes) {
			// A is the node to be changed
			for(const B of this.nodes) {
				if(A === B) continue;

				const dist = PVector.dist(A.pos, B.pos);
				const BPosCopy = new PVector(B.pos.x, B.pos.y);

				const force = BPosCopy.sub(A.pos).normalize(); // normalizealized, |force| = 1
				force.mult(-Graph.K * A.weight * B.weight / Math.pow(dist, 2.2));

				A.vel.add(force);
			}
		}

		for(const node of this.nodes) {
			if(node.vel.length() > 100) node.vel.normalize().mult(100);
			node.pos.add(node.vel);
		}

	}
}


/*
 * Every Node represents a file (not a folder). It can be linked
 * to other Nodes (all nodes and their links are represented in graph.json).
 */
class Node {
	constructor(path, name, links, x, y, r, color) {
		this.path       = path;
		this.name       = name;
		this.links      = links;

		this.pos        = new PVector(x, y);
		this.vel        = new PVector(0, 0);
		this.r          = r;
		this.weight     = 20 + links.length * 150;

		this.color = color;
	}

	onclick() {
		console.log("dblclick");
		window.location.href = this.path;
	}

	translate(x, y) {
		this.pos.add(new PVector(x, y));
	}

	scale(val) {
		this.r *= val;
		this.pos.mult(val);
	}
}

class Renderer {

	ctx = null;
    width = null;
    height = null;
	graph = null;
	
	// pos: obj {x, y}, attached: obj (Node), held: boolean
	mouse = {
		pos: {
			x: null,
			y: null,
		},
		pos_last: {
			x: 0,
			y: 0
		},
		attached: null,
		held: false,
	};

	constructor(ctx, width, height, graph){
		this.ctx = ctx;
		this.width = width;
		this.height = height;
		this.graph = graph;

		this.InitEventListeners();
	}

	updateMouse() {
		if(this.mouse.attached) {
			const diffX = this.mouse.pos.x - this.mouse.pos_last.x;
			const diffY = this.mouse.pos.y - this.mouse.pos_last.y;

			this.pos.attached.pos.add(new PVector(diffX, diffY));
		}        
	}
	
	draw() {
		this.ctx.fillStyle = "gray";
		this.ctx.fillRect(0, 0, this.width, this.height);

		// Render links
		for(const node of this.graph.nodes){
			const ctx = this.ctx;

			for(const link of node.links){
				ctx.beginPath();

				const linkedNode = this.graph.findNodeByPath(link);
				ctx.moveTo(node.pos.x, node.pos.y);
				ctx.lineTo(linkedNode.pos.x, linkedNode.pos.y);

				ctx.stroke();
			}
		}

		// Render nodes
		for(const node of this.graph.nodes){
			const ctx = this.ctx;

			ctx.beginPath();
			ctx.fillStyle = node.color;

			ctx.arc(node.pos.x, node.pos.y, node.r, 0, 2 * Math.PI);
			ctx.stroke();
			ctx.fill();
			ctx.font = "20px Georgia";
			ctx.fillStyle = "black";
			ctx.fillText(node.name, node.pos.x - node.name.length * 4, node.pos.y + Math.max(node.r * 2, 30));

			ctx.closePath();
		}
	}

	InitEventListeners() {

		canvas.addEventListener('dblclick', (e) => {
			this.mouse.pos.x = e.offsetX;
			this.mouse.pos.y = e.offsetY
			for(const node of this.graph.nodes){
				const dist = Math.sqrt(Math.pow(Math.abs(node.pos.x - this.mouse.pos.x), 2) + Math.pow(Math.abs(node.pos.y - this.mouse.pos.y), 2));
				if(dist < node.pos.r){
					node.onclick();
				} 
			}
		});

		canvas.addEventListener('mouseup', (e) => { 
			this.mouse.held = false;
			this.mouse.pos = { x: null, y: null };
			this.mouse.pos_last = { x: null, y: null };
			this.mouse.attached = null;
		}, false);

		// setup canvas event listeners
		canvas.addEventListener('mousedown', (e) => { 
			this.mouse.held = true;
			this.mouse.pos_last.x = this.ctx.offsetX;
			this.mouse.pos_last.y = this.ctx.offsetY;
			
		}, false);

		canvas.addEventListener('mousemove', (e) => {
			if (this.mouse.held) {

				this.mouse.pos.x = e.offsetX;
				this.mouse.pos.y = e.offsetY

				if(!this.mouse.attached) {
					// move map
					const diffX = this.mouse.pos.x - this.mouse.pos_last.x;
					const diffY = this.mouse.pos.y - this.mouse.pos_last.y;

					// translate all elements
					for(const node of this.graph.nodes){
						node.translate(diffX, diffY)
					}
				}

				this.mouse.pos_last.x = this.mouse.pos.x;
				this.mouse.pos_last.y = this.mouse.pos.y;
			}
		}, false);
		canvas.addEventListener('wheel', (e) => {
			e.preventDefault();
			if(e.deltaY > 0){
				// zoom out
				// ctx.scale(0.95, 0.95);
				for(const node of this.graph.nodes){
					node.scale(0.95);
				}
			} else {
				// zoom in
				// ctx.scale(1.05, 1.05);
				for(const node of this.graph.nodes){
					node.scale(1.05);
				}
			}
		}, false);
	}
}

export { Node, Renderer, Graph }
