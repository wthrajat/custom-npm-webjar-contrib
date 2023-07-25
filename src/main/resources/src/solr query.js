require(['jquery', 'xwiki-meta'], function($, xm) {
    var solrServiceURL = new XWiki.Document('SuggestSolrService', 'XWiki').getURL('get');
    var data = null;
    var nodeKeyCounter = 1;
    var edgeKeyCounter = 1;
    var openedDocumentReference = xm.document;
    console.log("This is xm.document haha ", xm.document)
  
  
    $.post(solrServiceURL, {
              outputSyntax: 'plain',
              nb: 5000,
              media: 'json',
              query: [
                  'q=*:*',
                  'q.op=AND',
                  'fq=type:DOCUMENT',
                  'fl=title_, reference, links, wiki, spaces, name'
              ].join('\n'),
              input: " "
          }, function(response) {
              tempData = response;
            const nodes = tempData.map(function(obj) {
                  return {
                      key: obj.reference,
                      attributes: {
                          label: obj.title_,
                          color: "#4086ff",
                          reference: obj.reference,
                          pageURL: new XWiki.Document(XWiki.Model.resolve(obj.reference)).getURL()
                      }
                  };
              });
  
              const edges = [];
              tempData.forEach(function(obj) {
                  if (obj.links && obj.links.length > 0) {
                      obj.links.forEach(function(link) {
                          var target = link.replace(/^entity:/, '');
                          var isValid = tempData.some(function(item) {
                              return item.reference === target;
                          });
                          if (isValid) {
                              edges.push({
                                  key: edgeKeyCounter.toString(),
                                  target: target,
                                  source: obj.reference
                              });
                              edgeKeyCounter++;
                          }
                      });
                  }
              });
              const output = {
                  nodes: nodes,
                  edges: edges
              };
  
      console.log("This is the modified data:", output);
  
      // Convert the output to a JSON string
      var jsonData = JSON.stringify(output, null, 2);
  
      // Create a Blob object from the JSON string
      var blob = new Blob([jsonData], { type: 'application/json' });
  
      // Create a URL for the Blob object
      var urlBlob = URL.createObjectURL(blob);
  
      // Open the URL in a new tab/window
      window.open(urlBlob);
    });
  });