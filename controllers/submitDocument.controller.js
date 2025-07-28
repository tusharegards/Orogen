import axios from "axios";
export const submitDocumentPayload = (req, res) => {
  let record = req.body; 
  let data = JSON.stringify({
  "signature_response": record
});
 
let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://exterprise.service-now.com/api/x_exter_exterlead/collect_signatures',
  headers: { 
    'Content-Type': 'application/json, application/json', 
    'Authorization': 'Basic RG9jdW1lbnQudXNlcjo6Q21eWyxNNFtBNSl5T1hxdHFhPlA='
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
