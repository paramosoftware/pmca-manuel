<template>
    <div :id="htmlId" class="w-full h-[60vh]">
        <div class="flex justify-between space-x-4 p-4">
            <h4 class="text-lg md:text-2xl font-semibold text-pmca-primary">
                Diagrama
            </h4>
            <div class="flex space-x-4">
                <UIIcon
                    name="ph:magnifying-glass-minus"
                    @click="zoomOut"
                    title="Diminuir zoom"
                />
                <UIIcon
                    name="ph:magnifying-glass-plus"
                    @click="zoomIn"
                    title="Aumentar zoom"
                />
                <UIIcon
                    name="ph:arrows-out-line-vertical"
                    @click="expandAllNodes"
                    title="Expandir todos nós"
                />
                <UIIcon
                    name="ph:arrows-in-line-vertical"
                    @click="collapseAllNodes"
                    title="Colapsar todos nós"
                />
                <!--
                <UIIcon
                    name="ph:arrows-in-cardinal"
                    @click="centerDiagram"
                    title="Centralizar diagrama"
                />
                -->
            </div>
        </div>
        <svg
            :viewBox="viewBox.join(' ')"
            :width="width"
            :height="height"
            style="max-width: 100%; height: auto"
            :style="{ 
                cursor: 'grab',
                font: '10px sans-serif',
                'user-select': 'none',
                overflow: 'hidden'
            }"

            :id="`${htmlId}-svg`"
        ></svg>
    </div>
</template>

<script setup lang="ts">
// Based on https://observablehq.com/@d3/collapsible-tree
// and https://github.com/PierreCapo/treeviz
import * as d3 from 'd3';

// TODO: Add functions downloadImage, resizeZoom, center [PMCA-453]
// TODO: Allow external access to the diagram methods and properties [PMCA-453]
// TODO: Refactor to improve reactivity [PMCA-453]
// TODO: Move focus to open node when clicking on the plus sign [PMCA-453]
// TODO: Improve click event handling in eye icon [PMCA-453]

const config = {
    nodeWidth: 120,
    nodeHeight: 60,
    xSpacing: 200,
    ySpacing: 150,
    margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },
    duration: 250
};

const lightGray = '#f7f7f7';
const gray = '#555';
const blue = '#79c8ff';
const green = '#a9cc44';

const conceptStore = useConceptStore();
const { conceptsTree } = storeToRefs(conceptStore);

if (!conceptsTree.value || !conceptsTree.value.length) {
    await conceptStore.fetchConceptsTree();
}

const htmlId = 'diagram';

if (conceptsTree.value.length > 1) {
    const root = {
        label: 'Raiz',
        id: 'root',
        parentId: null,
        expanded: true,
        position: 0,
        children: conceptsTree.value
    };

    conceptsTree.value = [root];
}

const data = ref(JSON.parse(JSON.stringify(conceptsTree.value[0])));
const svg = ref<D3SVGElement>();
const root = ref<D3Node>(d3.hierarchy(data.value) as D3Node);
const gLink = ref<D3SVGElement>();
const gNode = ref<D3SVGElement>();
const width = ref(0);
const height = ref(0);
const viewBox = ref([0, 0, 0, 0]) as Ref<number[]>;

onMounted(() => {
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    svg.value = createSVG(htmlId);
    gLink.value = createGLink(svg.value);
    gNode.value = createGNode(svg.value);


    root.value.descendants().forEach((d: D3Node, i) => {
        d.id = i;
        d._children = d.children;
        if (d.depth && d.depth > 1) d.children = null;
    });

    update(root.value, root.value, svg.value, gLink.value, gNode.value);

    centerDiagram();
});

function centerDiagram() {
    // Do not center the diagram if the root node is not visible
    const { areaWidth, areaHeight } = getArea(htmlId);
    const { x, y } = root.value;

    const scale = 0.8;
    const xPosition = areaWidth / 2 - x * scale;
    const yPosition = (areaHeight - 200 / 2) - y * scale;

    // @ts-ignore
    svg.value.attr('transform', `translate(${xPosition}, ${yPosition}) scale(${scale})`);
}

function updateDimensions() {
    const diagramContainer = document.getElementById(htmlId);

    if (!diagramContainer) {
        return;
    }

    width.value = diagramContainer.getBoundingClientRect().width;
    height.value = diagramContainer.getBoundingClientRect().height;
    viewBox.value = [
        -width.value / 2,
        -height.value / 2,
        width.value,
        height.value
    ];
}

function getArea(elementId: string) {
    const SVGContainer = document.querySelector(`#${elementId}-svg`);
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
        .attr('stroke', gray)
        .attr('stroke-width', 1.5)
        .attr('pointer-events', 'none');
}

function createGNode(svg: D3SVGElement) {
    return svg
        .append('g')
        .attr('cursor', 'pointer')
        .attr('pointer-events', 'all');
}

function createSVG(elementId: string) {
    const { areaHeight, areaWidth } = getArea(elementId);

    const svg = d3
        .select(`#${elementId}-svg`);

    const svgG = svg.append('g');

    const zoom = d3.zoom().on('zoom', (event) => {
        svgG.attr('transform', event.transform);
    }) as any;

    svg.call(zoom);

    return svgG
        .append('g')
        .attr('transform', `translate(${areaWidth / 2},${areaHeight * 5})`);
}

function tree(root: D3Node) {
    // @ts-ignore
    return d3.tree().nodeSize([config.xSpacing, config.ySpacing])(root);
}

function isNodeOpen(d: any) {
    const hasChildren = d.children || d._children;
    if (hasChildren && d.children) {
        return 'open';
    } else if (hasChildren && d._children) {
        return 'closed';
    } else {
        return 'no-children';
    }
}

function appendNode(node: D3SVGElement) {
    const getColor = (d: any, color: string) => {
        if (isNodeOpen(d) === 'open') {
            return color;
        } else if (isNodeOpen(d) === 'closed') {
            return color;
        } else {
            return 'transparent';
        }
    };

    const getSign = (d: any) => {
        if (isNodeOpen(d) === 'open') {
            return '-';
        } else if (isNodeOpen(d) === 'closed') {
            return '+';
        } else {
            return '';
        }
    };

    node.append('rect')
        .attr('width', config.nodeWidth)
        .attr('height', config.nodeHeight)
        .attr('fill', lightGray)
        .attr('stroke', gray)
        .attr('stroke-width', 1);

    node.append('circle')
        .attr('r', 10)
        .attr('cx', config.nodeWidth / 2)
        .attr('cy', config.nodeHeight)
        .attr('stroke', (d: any) => getColor(d, gray))
        .attr('fill', (d: any) => getColor(d, lightGray))
        .attr('stroke-width', 1);

    node.append('text')
        .attr('x', config.nodeWidth / 2)
        .attr('y', config.nodeHeight)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('fill', (d: any) => getColor(d, gray))
        .attr('font-size', 20)
        .attr('class', 'plus-minus')
        .text((d: any) => getSign(d));

    node.append('circle')
        .attr('r', 10)
        .attr('cx', config.nodeWidth)
        .attr('cy', 0)
        .attr('stroke', gray)
        .attr('fill', lightGray)
        .attr('stroke-width', 1)
        .attr('cursor', 'pointer')
        .on('click', (event, d) => {
            if (d.data.id != 'root') {
                window.open(`/termos/${d.data.slug}`, '_blank');
            }
        });

    node.append('text')
        .attr('x', config.nodeWidth)
        .attr('y', 0)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('fill', gray)
        .attr('font-size', 20)
        .attr('cursor', 'pointer')
        .text('👁')
        .on('click', (event, d) => {
            if (d.data.id != 'root') {
                window.open(`/termos/${d.data.slug}`, '_blank');
            }
        });
}

function appendLabel(node: D3SVGElement) {
    node.append('foreignObject')
        .attr('width', config.nodeWidth)
        .attr('height', config.nodeHeight)
        .append('xhtml:div')
        .style('width', '100%')
        .style('height', '100%')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .style('font-size', '12px')
        .style('color', 'black')
        .style('text-align', 'center')
        .html((d: any) => d.data.label);
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
        .attr('stroke', gray)
        .attr('stroke-width', 3) as any;

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
        .attr('transform', `translate(${source.x0},${source.y0})`)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0)
        .on('click', (event, d) => {
            d.children = d.children ? null : d._children;
            update(d, root, svg, gLink, gNode);
        }) as unknown as D3SVGElement;

    appendNode(nodeEnter);
    appendLabel(nodeEnter);

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
    source: D3Node,
    root: D3Node,
    svg: D3SVGElement,
    gLink: D3SVGElement,
    gNode: D3SVGElement
) {
    const nodes = root.descendants().reverse();
    const links = root.links();

    const ancestors = source.ancestors();

    const gElements = svg.selectAll('g');

    gElements.selectAll("text[class^='plus-minus']").text((d: any) => {
        return isNodeOpen(d) === 'open' ? '-' : '+';
    });

    gElements.selectAll('rect').attr('fill', (d: any) => {
        return ancestors.includes(d) ? blue : lightGray;
    });

    gElements.selectAll('path').attr('stroke', (d: any) => {
        return ancestors.includes(d.target) ? green : gray;
    });

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

function zoomIn() {
    const zoom = d3.zoom().on('zoom', (event) => {
        svg.value.attr(
            'transform',
            event.transform
        );
    }) as any;

    svg.value.call(zoom.scaleBy, 1.2);
}

function zoomOut() {
    const zoom = d3.zoom().on('zoom', (event) => {
        svg.value.attr(
            'transform', event.transform
        );
    }) as any;

    svg.value.call(zoom.scaleBy, 0.8);
}

function expandAll(node: D3Node) {
    if (node._children) {
        node.children = node._children;
        node._children = null;
    }
    if (node.children) {
        node.children.forEach(expandAll);
    }
}

function expandAllNodes() {
    expandAll(root.value);
    update(root.value, root.value, svg.value, gLink.value, gNode.value);
}

function collapseAll(node: D3Node) {
    if (node.children) {
        node._children = node.children;
        node.children = null;
    }
    if (node._children) {
        node._children.forEach(collapseAll);
    }
}

function collapseAllNodes() {
    collapseAll(root.value);
    update(root.value, root.value, svg.value, gLink.value, gNode.value);
}
</script>
