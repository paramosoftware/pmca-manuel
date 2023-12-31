<template>
    <div id="vis-network"></div>
</template>
  
<script setup>
import { Network } from "vis-network/standalone";

const entries = ref([])
const router = useRouter()

const fetchEntries = async () => {
  const { data } = await useFetchWithBaseUrl('/api/entry?query=' + JSON.stringify({
    pageSize: -1,
    include: {
      entries: true,
      media: {
        orderBy: ['position'],
        include: ['media']
      }
    },
    where: {
      isCategory: false
    },
  }));

  entries.value = data.value.data;
}

await fetchEntries();

const nodes = entries.value.map((entry) => ({
  id: entry.id,
  value: entry.entries.length,
  label: entry.name,
}));

const edges = entries.value.flatMap((entry) =>
  entry.entries.map((child) => ({
    from: entry.id,
    to: child.id,
  }))
);

const data = {
  nodes: nodes,
  edges: edges,
};


const options = {
    autoResize: true,
    height: "100%",
    width: "100%",
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
  network = new Network(container, data, options);
  network.on("click", function (event) {
    const entryId = event.nodes[0];
    const entrySlug = entries.value.find((entry) => entry.id === entryId).nameSlug;
    router.push('/verbetes/' + entrySlug);
  });
});
</script>