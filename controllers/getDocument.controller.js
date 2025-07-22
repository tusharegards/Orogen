import payload from "../assets/scripts/input.js";

export const getDocumentPayload = (req, res) => {
  let username = "tushart@exterprise.in";
  let password = "Password@2151";
  let doc;

  let promise = new Promise((resolve, reject) => {
    let uri =
      "https://exterprisedev.service-now.com/api/now/v2/table/x_exter_exterlead_document_attachment/28d03e0a2bf22610cddaffa95e91bf69";
    let encoded = Buffer.from(username + password).toString("base64");
    let auth = "Basic TW9oaXQuZXh0Olc4biNpRz9Y";
    console.log(auth);

    let h = new Headers({
      Accept: "application/json",
      Authorization: `${auth}`,
      "Content-Type": "application/json",
    });

    let req = new Request(uri, {
      method: "GET",
      headers: h,
      credentials: "same-origin",
    });

    fetch(req)
      .then((res) => {
        return res.json();
      })
      .then((res2) => {
        const document = JSON.parse(res2.result.payload);
        console.log("output" + document);
        res.render("loanform", { content: document });
      });
  });
};
