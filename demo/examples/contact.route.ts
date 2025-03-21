interface Contact {
  firstName: string;
  lastName: string;
  email: string;
}

const contact1: Contact = {
  firstName: "Joe",
  lastName: "Blow",
  email: "joe@blow.com",
};

export default async (req: Request): Promise<Response | null> => {
  let content: string | undefined;

  switch (req.method) {
    case "GET": {
      if (req.url.includes("edit")) {
        content = edit(contact1);
      } else {
        content = view(contact1);
      }
      break;
    }
    case "PUT": {
      const form = await req.formData();
      for (const [key, val] of form) {
        if (key in contact1 && typeof val === "string") {
          contact1[key as keyof Contact] = val;
        }
      }
      content = view(contact1);
      break;
    }
  }

  if (content) {
    return new Response(content, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  }

  return null;
};

function view({ firstName, lastName, email }: Contact) {
  return `
<div class="contact table rows">
  <p>
    <label>First Name</label>
    <output>${firstName}</output>
  </p>
  <p>
    <label>Last Name</label>
    <output>${lastName}</output>
  </p>
  <p>
    <label>Email</label>
    <output>${email}</output>
  </p>
  <div class="tool-bar">
    <button on-click="get contact?edit |> target closest .contact |> swap outer">Click To Edit</button>
  </div>
</div>
`;
}

function edit({ firstName, lastName, email }: Contact) {
  return `
<form class="contact table rows" on-submit="preventDefault |> put contact |> swap outer">
  <p>
    <label>First Name</label>
    <input type="text" name="firstName" value="${firstName}">
  </p>
  <p>
    <label>Last Name</label>
    <input type="text" name="lastName" value="${lastName}">
  </p>
  <p>
    <label>Email Address</label>
    <input type="email" name="email" value="${email}">
  </p>
  <div class="tool-bar">
    <button>Submit</button>
    <button on-click="get contact |> target closest .contact |> swap outer">Cancel</button>
  </div>
</form>
`;
}
