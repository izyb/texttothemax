const texttothemax = (sampleText) => {
  const SVG_WIDTH = 352;
  const SVG_HEIGHT = 512;
  const numLayers = 6;
  const isChrome = !!window.chrome && !!window.chrome.webstore;
  const layerCellWidth = i => SVG_WIDTH / 2 ** i;
  const layerCellHeight = j => SVG_HEIGHT / 2 ** j;

  class TextNode {
    constructor(layer, i, j, char) {
      this.layer = layer;
      this.i = i;
      this.j = j;
      this.char = char;
      this.parent = null;
      this.id = `${layer}_${i}_${j}`;
    }

    isSplittable() {
      return this.layer < numLayers - 1;
    }

    split() {
      const layerDown = layers[this.layer + 1];
      return [
        layerDown[this.j * 2][this.i * 2],
        layerDown[this.j * 2 + 1][this.i * 2],
        layerDown[this.j * 2][this.i * 2 + 1],
        layerDown[this.j * 2 + 1][this.i * 2 + 1],
      ].map(tn => { tn.parent = this; return tn; });
    }
  }

  const constructLayers = () => {
    for (let i = 0; i < numLayers; i += 1) {
      let wi = 0;
      const layer = [];
      for (let k = 0; k < 2 ** i; k += 1) {
        const row = [];
        let newLine = false;
        for (let j = 0; j < 2 ** i; j += 1) {
          if (!newLine) {
            newLine = sampleText[wi] === '\n'
            row.push(new TextNode(i, j, k, sampleText[wi++]));
          } else {
            row.push(new TextNode(i, j, k, ''));
          }
        }
        layer.push(row);
      }
      layers.push(layer);
    }
    layers[0].slice().forEach(row => displayed.push(...row));
  }

  let t = null;
  const setTimer = () => {
    setInterval(() => t = null, 200)
  }

  const onMouseMove = (d) => {
    if (t !== (d.parent || d).id && d.isSplittable()) {
      displayed.splice(displayed.indexOf(d), 1);
      displayed.push(...d.split());
      renderLetters(displayed);
      t = (d.parent || d).id;
    }
  }


  const svg = d3.select('#letters')
    .append('svg')
    .attr('height', SVG_HEIGHT)
    .attr('width', SVG_WIDTH);

  const renderLetters = (data) => {
    var g = svg.selectAll('g')
      .data(data, d => d.id);

    g.exit()
      .on('mousemove', null)
      .transition()
      .duration(200)
      .attr('opacity', 0)
      .remove();

    g.enter().append('g')
      .call(container => container.append('text')
        .text(d => d.char)
        .attr('dominant-baseline', 'hanging')
        .style('font-size', d => `${layerCellHeight(d.layer)}px`)
        .style('color', 'rgba(0,0,0,0.87)')
        .attr('x', (d, i, arr) => Math.abs(layerCellWidth(d.layer) - arr[i].getBoundingClientRect().width) / 2)
        .attr('y', (d, i, arr) => {
          return isChrome
            ? Math.abs(layerCellHeight(d.layer) - arr[i].getBoundingClientRect().height) / 2
            : 0;
        })
      )
      .call(container => container.append('rect')
        .attr('fill', 'transparent')
        .attr('width', d => layerCellWidth(d.layer))
        .attr('height', d => layerCellHeight(d.layer))
      )
      .call(container => container.on('mousemove', onMouseMove))
      .attr('transform', d => {
        const p = d.parent || d;
        return `translate(${(p.i + 1 / 2) * layerCellWidth(p.layer)}, ${(p.j + 1 / 2) * layerCellHeight(p.layer)})scale(0)`;
      })
      .attr('opacity', 0)
      .transition()
      .duration(300)
      .attr('opacity', 1)
      .attr(
        'transform',
        d => `translate(${d.i * layerCellWidth(d.layer)}, ${d.j * layerCellHeight(d.layer)}),scale(1)`,
      )

  }

  const layers = [];
  const displayed = [];

  setTimer();
  constructLayers();
  renderLetters(displayed);
};
