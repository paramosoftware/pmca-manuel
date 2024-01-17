<template>
  <div class="mt-5 md:mx-auto min-h-[60vh] w-full" v-if="entries.length > 0">

      <div id="vis-network" class="w-full h-full"></div>

  </div>
</template>
  
<script setup>
import { Network } from "vis-network/standalone";

// TODO: consider using a D3 force graph instead of vis-network

const router = useRouter()

const entryStore = useEntryStore();
const { entriesNetwork: entries } = storeToRefs(entryStore);

if (!entries.value || entries.value.length === 0) {
  await entryStore.fetchNetwork();
}


const nodes = entries.value.map((entry) => ({
  id: entry.id,
  value: 1,
  label: entry.name,
}));

const edges = entries.value.flatMap((entry) =>
  entry.entries?.map((child) => ({
    from: entry.id,
    to: child.id,
  }))
);

const data = {
  nodes: nodes,
  edges: edges,
};


const options = {
    height: "100%",
    width: "100%",
    layout: {
      improvedLayout: false,
    },
    interaction: {
      hover: true,
      tooltipDelay: 200,
    },
    nodes: {
      shape: "dot",
      scaling: {
        customScalingFunction: function (min, max, total, value) {
          return value / total;
        },
        min: 5,
        max: 150,
      },
      color: {
        border: "#6699ff",
        background: "#6699ff",
        highlight: {
          border: "#3d405c",
          background: "#3d405c",
        },
        hover: {
          border: "#3d405c",
          background: "#3d405c",
        },
      },
    },
    edges: {
      color: {
        color: "#4054b2",
        highlight: "#4054b2",
        hover: "#4054b2",
      },
      smooth: {
        type: "continuous",
      },
    },
};

let network;

onMounted(() => {
  const container = document.getElementById("vis-network");

  if (!container) {
    return;
  }

  network = new Network(container, data, options);
  network.on("click", function (event) {
    const entryId = event.nodes[0];
    const entrySlug = entries.value.find((entry) => entry.id === entryId).nameSlug;
    router.push('/verbetes/' + entrySlug);
  });

  network.on('stabilized', function() {
      network.moveTo({
          scale: 1,
          animation: {
              duration: 1500,
              easingFunction: 'easeInOutQuad'
          }
      });
  });
});
</script>