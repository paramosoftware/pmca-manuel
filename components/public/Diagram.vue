<template>
    <div id="network" class="w-[95vw] h-[50vh]">

    </div>
</template>

<script setup lang="ts">
// Based on https://observablehq.com/@d3/collapsible-tree@latest
// and https://github.com/PierreCapo/treeviz
import * as d3 from 'd3';

const conceptStore = useConceptStore();
await conceptStore.fetchConceptsTree();
const { conceptsTree } = storeToRefs(conceptStore);

const data = JSON.parse(JSON.stringify(conceptsTree.value))[0];

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

function drawLink(d, source, nodeWidth, nodeHeight) {
    return `M ${source.x + nodeWidth / 2} ${source.y}
            L ${source.x + nodeWidth / 2} ${(source.y + d.y + nodeHeight) / 2}
            L  ${d.x + nodeWidth / 2} ${(source.y + d.y + nodeHeight) / 2}
            ${d.x + nodeWidth / 2} ${d.y + nodeHeight} `;
}

onMounted(() => {
    const { areaHeight, areaWidth } = getArea('network');

    const width = areaWidth;
    const marginTop = 0;
    const marginRight = 0;
    const marginBottom = 0;
    const marginLeft = 0;

    const root = d3.hierarchy(data);

    const dx = 100;
    const dy = width / (root.height + 1);

    const tree = d3.tree().nodeSize([dx, dy]);

    const svg = d3
        .select('#network')
        .append('svg')
        .attr('width', areaWidth)
        .attr('height', areaHeight)
        .style('font', '10px sans-serif')
        .style('user-select', 'none')
        .style('cursor', 'grab')
        .style('overflow', 'hidden')
        .call(
            d3.zoom().on('zoom', (event) => {
                svg.attr('transform', event.transform);
            })
        )
        .append('g')
        .attr('transform', `translate(${width / 2},${dx})`);

    const gLink = svg
        .append('g')
        .attr('fill', 'none')
        .attr('stroke', '#555')
        .attr('stroke-opacity', 0.4)
        .attr('stroke-width', 1.5);

    const gNode = svg
        .append('g')
        .attr('cursor', 'pointer')
        .attr('pointer-events', 'all');

    function update(event, source) {
        const duration = event?.altKey ? 2500 : 250;
        const nodes = root.descendants().reverse();
        const links = root.links();

        tree(root);

        let left = root;
        let right = root;
        root.eachBefore((node) => {
            if (node.x < left.x) left = node;
            if (node.x > right.x) right = node;
        });

        const height = right.x - left.x + marginTop + marginBottom;

        const transition = svg
            .transition()
            .duration(duration)
            .attr('height', height)
            .attr('viewBox', [-marginLeft, left.x - marginTop, width, height])
            .tween(
                'resize',
                window.ResizeObserver
                    ? null
                    : () => () => svg.dispatch('toggle')
            );

        const node = gNode.selectAll('g').data(nodes, (d) => d.id);

        const nodeEnter = node
            .enter()
            .append('g')
            .attr('transform', (d) => `translate(${source.x0},${source.y0})`)
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            .on('click', (event, d) => {
                d.children = d.children ? null : d._children;
                update(event, d);
            });

        const nodeWidth = 60;
        const nodeHeight = 30;

        nodeEnter
            .append('rect')
            .attr('width', nodeWidth)
            .attr('height', nodeHeight)
            .attr('fill', (d) => (d._children ? '#555' : '#999'));

        // let's wrap the text in the node rectangle
        nodeEnter
            .append('foreignObject')
            .attr('width', nodeWidth)
            .attr('height', nodeHeight)
            .append('xhtml:div')
            .style('width', '100%')
            .style('height', '100%')
            .style('display', 'flex')
            .style('justify-content', 'center')
            .style('align-items', 'center')
            .style('font-size', '8px')
            .style('color', 'white')
            .style('text-align', 'center')
            .html((d) => d.data.label);

        node
            .merge(nodeEnter)
            .transition(transition)
            .attr('transform', (d) => `translate(${d.x},${d.y})`)
            .attr('fill-opacity', 1)
            .attr('stroke-opacity', 1);

        const nodeExit = node
            .exit()
            .transition(transition)
            .remove()
            .attr('transform', (d) => `translate(${source.x},${source.y})`)
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0);

        const link = gLink.selectAll('path').data(links, (d) => d.target.id);

        const linkEnter = link
            .enter()
            .append('path')
            .attr('d', (d) =>
                drawLink(d, source, nodeWidth, nodeHeight)
            )
            .attr('stroke', (d) => d.target.data.color)
            .attr('stroke-width', 2);

        link.merge(linkEnter)
            .transition(transition)
            .attr('d', (d) => {
                const s = { x: d.source.x, y: d.source.y };
                const t = { x: d.target.x, y: d.target.y };
                return `M ${s.x + nodeWidth / 2} ${s.y}
                    L ${s.x + nodeWidth / 2} ${(s.y + t.y + nodeHeight) / 2}
                    L  ${t.x + nodeWidth / 2} ${(s.y + t.y + nodeHeight) / 2}
                    ${t.x + nodeWidth / 2} ${t.y + nodeHeight} `;
            });

        link.exit()
            .transition(transition)
            .remove()
            .attr('d', (d) =>
                drawLink(d, source, nodeWidth, nodeHeight)
            );

        root.eachBefore((d) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    root.x0 = dy / 2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
        d.id = i;
        d._children = d.children;
        if (d.depth && d.depth > 2) d.children = null;
    });

    update(null, root);
});


</script>
