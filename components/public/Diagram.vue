<template>
    <div id="network" class="w-screen h-screen bg-gray-50"></div>
</template>

<script setup lang="ts">
// Based on https://observablehq.com/@d3/collapsible-tree
// and https://github.com/PierreCapo/treeviz
import * as d3 from 'd3';
const config = {
    nodeWidth: 80,
    nodeHeight: 40,
    xSpacing: 100,
    ySpacing: 60,
    margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },
    duration: 250
};

const blue = '#6699ff';
const green = '#a9cc44';

const conceptStore = useConceptStore();
await conceptStore.fetchConceptsTree();
const { conceptsTree } = storeToRefs(conceptStore);

const data = ref(JSON.parse(JSON.stringify(conceptsTree.value))[0]);
const svg = ref<D3SVGElement>();

onMounted(() => {
    const root = d3.hierarchy(data.value) as D3Node;
    svg.value = createSVG('network');
    const gLink = createGLink(svg.value);
    const gNode = createGNode(svg.value);

    root.descendants().forEach((d: D3Node, i) => {
        d.id = i;
        d._children = d.children;
        if (d.depth && d.depth > 1) d.children = null;
    });

    update(null, root, root, svg.value, gLink, gNode);
});

function getArea(elementId: string) {
    const SVGContainer = document.querySelector(`#${elementId}`);
    if (!SVGContainer) {
        console.error(`The container with id ${elementId} was not found`);
        return { areaWidth: 0, areaHeight: 0 };
    }
    const areaWidth = SVGContainer.clientWidth;
    const areaHeight = SVGContainer.clientHeight;
    return { areaWidth, areaHeight };
}

function drawLink(target: Coords, source: Coords) {
    return `M ${source.x + config.nodeWidth / 2} ${source.y}
            L ${source.x + config.nodeWidth / 2} ${(source.y + target.y + config.nodeHeight) / 2}
            L  ${target.x + config.nodeWidth / 2} ${(source.y + target.y + config.nodeHeight) / 2}
            ${target.x + config.nodeWidth / 2} ${target.y + config.nodeHeight} `;
}

function createGLink(svg: D3SVGElement) {
    return svg
        .append('g')
        .attr('fill', 'none')
        .attr('stroke', '#555')
        .attr('stroke-opacity', 0.4)
        .attr('stroke-width', 1.5);
}

function createGNode(svg: D3SVGElement) {
    return svg
        .append('g')
        .attr('cursor', 'pointer')
        .attr('pointer-events', 'all');
}

function appendForeignObject(node: D3SVGElement) {
    node.append('foreignObject')
        .attr('width', config.nodeWidth)
        .attr('height', config.nodeHeight)
        .append('xhtml:div')
        .style('width', '100%')
        .style('height', '100%')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .style('font-size', '8px')
        .style('color', 'white')
        .style('text-align', 'center')
        .html((d: any) => d.data.label);
}

function createSVG(elementId: string) {
    const { areaHeight, areaWidth } = getArea(elementId);

    const svg = d3
        .select(`#${elementId}`)
        .append('svg')
        .attr('width', areaWidth)
        .attr('height', areaHeight)
        .style('font', '10px sans-serif')
        .style('user-select', 'none')
        .style('cursor', 'grab')
        .style('overflow', 'hidden');

    const svgG = svg.append('g');

    const zoom = d3.zoom().on('zoom', (event) => {
        svgG.attr('transform', event.transform);
    }) as any;

    svg.call(zoom);

    return svgG
        .append('g')
        .attr('transform', `translate(${areaWidth / 2}, ${areaHeight / 10})`);
}

function tree(root: D3Node) {
    // @ts-ignore
    return d3.tree().nodeSize([config.xSpacing, config.ySpacing])(root);
}

function appendNode(node: D3SVGElement) {
    node.append('rect')
        .attr('width', config.nodeWidth)
        .attr('height', config.nodeHeight)
        .attr('fill', (d: any) => (d._children ? green : blue));
}

function addNodeExitTransition(node: D3SVGElement, transition: any) {
    node.exit()
        .transition(transition)
        .remove()
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0);
}

function updateDiagramLinks(
    gLink: D3SVGElement,
    links: any[],
    source: Coords,
    transition: any
) {
    const link = gLink.selectAll('path').data(links, (d: any) => d.target.id);

    const linkEnter = link
        .enter()
        .append('path')
        .attr('d', (d) => drawLink(d, source))
        .attr('stroke', '#555')
        .attr('stroke-width', 2) as any;

    link.merge(linkEnter)
        .transition(transition)
        .attr('d', (d) => {
            return drawLink(d.target, d.source);
        });

    link.exit()
        .transition(transition)
        .remove()
        .attr('d', (d: any) => drawLink(d, source));
}

function updateDiagramNodes(
    nodes: any[],
    source: Coords,
    root: D3Node,
    svg: D3SVGElement,
    gLink: D3SVGElement,
    gNode: D3SVGElement,
    transition: any
) {
    const node = gNode.selectAll('g').data(nodes, (d: any) => d.id);

    const nodeEnter = node
        .enter()
        .append('g')
        .attr('transform', (d) => `translate(${source.x0},${source.y0})`)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0)
        .on('click', (event, d) => {
            d.children = d.children ? null : d._children;
            update(event, d, root, svg, gLink, gNode);
        }) as unknown as D3SVGElement;

    appendNode(nodeEnter);
    appendForeignObject(nodeEnter);

    // @ts-ignore
    node.merge(nodeEnter)
        .transition(transition)
        .attr('transform', (d) => `translate(${d.x},${d.y})`)
        .attr('fill-opacity', 1)
        .attr('stroke-opacity', 1);

    // @ts-ignore
    addNodeExitTransition(node, transition);
}

function update(
    event: any,
    source: D3Node,
    root: D3Node,
    svg: D3SVGElement,
    gLink: D3SVGElement,
    gNode: D3SVGElement
) {
    const nodes = root.descendants().reverse();
    const links = root.links();

    tree(root);

    let left = root;
    let right = root;
    root.eachBefore((node) => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
    });

    const height = right.x - left.x + config.margin.top + config.margin.bottom;

    const transition = svg
        .transition()
        .duration(config.duration)
        .attr('height', height)
        .tween(
            'resize',
            // @ts-ignore
            window.ResizeObserver ? null : () => () => svg.dispatch('toggle')
        );

    updateDiagramNodes(nodes, source, root, svg, gLink, gNode, transition);

    updateDiagramLinks(gLink, links, source, transition);

    root.eachBefore((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}
</script>
