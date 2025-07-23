import axios from "axios";
export const submitDocumentPayload = (req, res) => {
  let record = req.body; 
  let data = JSON.stringify({
  "signature_response": record
});
 
let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://exterprisedev.service-now.com/api/x_exter_exterlead/collect_signatures',
  headers: { 
    'Content-Type': 'application/json, application/json', 
    'Authorization': 'Basic TW9oaXQuZXh0Olc4biNpRz9Y'
  },
  data : data
};
 
axios.request(config)
.then((response) => {
  res.render('thanks')
})
.catch((error) => {
  console.log(error);
});
};
