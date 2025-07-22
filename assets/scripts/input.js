var payload = [
  {
    page_rank: 1,
    content_stack: [
      {
        content_type: "Image",
        content_body: "<img src='assets/images/image.png' alt='Atrium Logo' />",
      },
      {
        content_type: "Image",
        content_body: "<img src='images/image.png' alt='Atrium Logo' />",
      },
      {
        content_type: "Html",
        content_body: "<p>Welcome to the Loan Form</p>",
      },
      {
        content_type: "Signature",
        content_body: `<div class="row">
			<div class="col-md-12">
		 		<canvas id="sig-canvas" width="620" height="160" name="sig-canvas">
		 			Get a better browser, bro.
		 		</canvas>
		 	</div>
		</div>
		<div class="row">
			<div class="col-md-12">
				<button class="btn btn-primary" id="sig-submitBtn">Submit Signature</button>
				<button class="btn btn-default" id="sig-clearBtn">Clear Signature</button>
			</div>
		</div>`,
      },
      {
        content_type: "Image",
        content_body: "<img src='images/image.png' alt='Atrium Logo' />",
      }
    ]
  },
  {
    page_rank: 2,
    content_stack: [
      {
        content_type: "Html",
        content_body: "<h2>Loan Application Form</h2>",
      },
      {
        content_type: "Signature",
        content_body: `<div class="row">
			<div class="col-md-12">
		 		<canvas id="sig-canvas" width="620" height="160" name="sig-canvas">
		 			Get a better browser, bro.
		 		</canvas>
		 	</div>
		</div>
		<div class="row">
			<div class="col-md-12">
				<button class="btn btn-primary" id="sig-submitBtn">Submit Signature</button>
				<button class="btn btn-default" id="sig-clearBtn">Clear Signature</button>
			</div>
		</div>`
      },
      {
        content_type: "Button",
        content_body:
          "<button class='btn btn-primary' id='sig-submitBtn'>testing Button from Input</button>",
      }
    ]
  }
];

export default payload;
