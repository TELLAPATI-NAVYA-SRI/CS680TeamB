const Recombee = require('recombee-api-client');
const { AddItemProperty} = Recombee.requests;
const {ApiClient} = Recombee;

const client = new ApiClient('staywise-dev', 'X6Buh2ESu5iIpudR70bOvgXXcS2TSgxeSyvzjOy0Jf4Cv7RTyyzmPrx1GBqsr50C', {
    region: 'eu-west',
  });

async function defineProperties() {
  try {
    
        await client.send(new AddItemProperty('location.state', 'string'));
        await client.send(new AddItemProperty('location.city', 'string'));
        
    console.log('Properties defined successfully');
  } catch (error) {
    console.error('Error defining properties:', error);
  }
}

defineProperties();
