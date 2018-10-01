const textArea = d3.select('#letters')
  .append('textarea')
  .attr('id', 'user-input')
  .node()
  .focus();

const button = d3.select('#container')
  .append('button')
  .text(() => 'Go!')
  .call((buttonNode) => {
    buttonNode.on('click', () => {
      const { value } = document.getElementById('user-input');
      if (value) {
        buttonNode.transition()
          .duration(300)
          .style('opacity', 0);
        setTimeout(() => {
          d3.select('#user-input').remove();
          buttonNode.remove();
          texttothemax(value);
        }, 300);
      }
    })
  });