"use strict;"

export { PVector, Node, Renderer, Graph }

const canvasDOM = document.getElementById('canvas');

class PVector {
	constructor(x, y){
		this.x = x;
		this.y = y;
	}

	static dist(v1, v2){
		const dX = v1.x - v2.x;
		const dY = v1.y - v2.y;

		return Math.sqrt(dX * dX + dY * dY);
	}

	set(x, y){
		this.x = x;
		this.y = y;
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

	calculateAverageForce(){
		let avg = new PVector(0, 0);
		for(const node of this.nodes){
			avg.add(node.vel);
		}
		return { x: avg.x, y: avg.y };
	}

	getStats(){

		const n = this.nodes.length;

		// calc average forces
		const avg = new PVector(0, 0);
		for(const node of this.nodes){
			avg.add(node.vel);
		}

		// connections
		const links = null;

		// scale
		const scale = this.nodes[0].currentScale;

		// pos
		const pos = null;
		

		return { n, scale: scale, x: avg.x, y: avg.y, links };
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
		this.path         = path;
		this.name         = name;
		this.links        = links;

		this.pos          = new PVector(x, y);
		this.vel          = new PVector(0, 0);
		this.weight       = 20 + links.length * 150;
		this.r            = 20 + links.length * 3;
		this.currentScale = 1;

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
		this.currentScale *= val;
	}
}

class Mouse {
	constructor(){
		this.pos = new PVector(0, 0);
		this.pos_last = new PVector(0, 0);
		this.attached = null;
		this.hovered = null;
		this.held = false;
	}
}

class Renderer {

	constructor(ctx, width, height, graph){
		this.ctx = ctx;
		this.width = width;
		this.height = height;
		this.graph = graph;

		this.mouse = new Mouse();

		this.InitEventListeners();
	}

	updateMouse() {
		if(this.mouse.attached) {
			const diffX = this.mouse.pos.x - this.mouse.pos_last.x;
			const diffY = this.mouse.pos.y - this.mouse.pos_last.y;

			this.mouse.attached.pos.set(this.mouse.pos.x, this.mouse.pos.y);
		}        
	}
	
	draw() {
		this.ctx.fillStyle = "#171616";
		this.ctx.fillRect(0, 0, this.width, this.height);

		// Render links
		for(const node of this.graph.nodes){
			const ctx = this.ctx;
			const links = node.links.map(l => this.graph.findNodeByPath(l));

			this.mouse.hovered === node ? ctx.strokeStyle = "white" : ctx.strokeStyle = "#AA9E9E";

			for(const linkedNode of links){
				ctx.beginPath();

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
			
			// if the node is hovered - highlight it
			this.mouse.hovered === node ? ctx.strokeStyle = "white" : ctx.strokeStyle = "black";

			ctx.arc(node.pos.x, node.pos.y, node.r, 0, 2 * Math.PI);
			ctx.stroke();
			ctx.fill();
			ctx.font = "16px Georgia";
			ctx.fillStyle = "#AA9E9E";
			ctx.fillText(node.name, node.pos.x - node.name.length * 4, node.pos.y + Math.max(node.r * 2, 30));

			ctx.closePath();
		}
	}

	InitEventListeners() {

		canvas.addEventListener('dblclick', (e) => {
			this.mouse.pos.set(e.offsetX, e.offsetY);

			for(const node of this.graph.nodes){
				const dist = PVector.dist(this.mouse.pos, node.pos);

				if(dist < node.r){
					node.onclick();
				} 
			}
		});

		canvas.addEventListener('mouseup', (e) => { 
			this.mouse.held = false;
			this.mouse.pos.set(null, null);
			this.mouse.pos_last.set(null, null);
			this.mouse.attached = null;
		}, false);

		// setup canvas event listeners
		canvas.addEventListener('mousedown', (e) => { 
			this.mouse.held = true;

			for(const node of this.graph.nodes){
				const dist = PVector.dist(node.pos, this.mouse.pos);
				if(dist < node.r){
					this.mouse.attached = node;
				}
			}

		}, false);

		canvas.addEventListener('mousemove', (e) => {
			this.mouse.pos_last.set(this.mouse.pos.x, this.mouse.pos.y);
			this.mouse.pos.set(e.offsetX, e.offsetY);
			if (this.mouse.held) {

				if(!this.mouse.attached) {
					// move map
					const diffX = this.mouse.pos.x - this.mouse.pos_last.x;
					const diffY = this.mouse.pos.y - this.mouse.pos_last.y;

					// translate all elements
					for(const node of this.graph.nodes){
						node.translate(diffX, diffY)
					}
				}

			} 
			else {
				this.mouse.hovered = null;
				for(const node of this.graph.nodes){
					const dist = PVector.dist(node.pos, this.mouse.pos);
					if(dist < node.r){
						this.mouse.hovered = node;
					}
				}
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

