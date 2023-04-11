let state = {
  inputValue: localStorage.getItem("inputValue") ?? "",
  path: window.location.pathname,
  contacts: [],
  favoriteContacts: JSON.parse(localStorage.getItem("favoriteContacts")) ?? [],
  isLoading: false,
  errorMessage: "",
};

function setState(newState) {
  const prevState = state;
  const nextState = { ...state, ...newState };
  state = nextState;
  render();
  onStateChange(prevState, nextState);
}

let timer;

function onStateChange(prevState, nextState) {
  if (prevState.path != nextState.path) {
    history.pushState(null, "", nextState.path);
  }

  if (prevState.inputValue != nextState.inputValue) {
    localStorage.setItem("inputValue", nextState.inputValue);

    if (timer) {
      clearTimeout(timer);
    }

    setState({ isLoading: true });
    timer = setTimeout(() => {
      fetch(`https://dummyjson.com/users/search?q=${nextState.inputValue}`)
        .then((res) => res.json())
        .then((data) => setState({ contacts: data.users, errorMessage: "" }))
        .catch((err) => setState({ contacts: [], errorMessage: err.message }))
        .finally(() => setState({ isLoading: false }));
    }, 600);
  }

  if (prevState.favoriteContacts != nextState.favoriteContacts) {
    localStorage.setItem(
      "favoriteContacts",
      JSON.stringify(nextState.favoriteContacts)
    );
  }
}

function Link(props) {
  const link = document.createElement("a");
  link.textContent = props.textContent;
  link.href = props.href;
  link.onclick = function (event) {
    event.preventDefault();
    const url = new URL(event.target.href);
    setState({ path: url.pathname });
  };
  return link;
}

function Navbar() {
  const homeLink = Link({ textContent: "Home", href: "/" });
  const favoriteContactsLink = Link({
    textContent: "Favorite Contacts",
    href: "/favorite-contacts",
  });
  const aboutLink = Link({ textContent: "About", href: "/about" });

  const wrapper = document.createElement("div");
  wrapper.appendChild(homeLink);
  wrapper.appendChild(favoriteContactsLink);
  wrapper.appendChild(aboutLink);

  return wrapper;
}

function ContactListItem(props) {
  const name = document.createElement("p");
  name.textContent = `${props.firstName} ${props.maidenName} ${props.lastName}`;

  const email = document.createElement("p");
  email.textContent = props.email;

  const addFavoriteButton = document.createElement("button");
  addFavoriteButton.textContent = "add to favorite";
  addFavoriteButton.onclick = function () {
    const favoriteContacts = state.favoriteContacts.concat({
      id: props.id,
      firstName: props.firstName,
      lastName: props.lastName,
      maidenName: props.maidenName,
      email: props.email,
    });
    setState({ favoriteContacts });
  };

  const removeFavoriteButton = document.createElement("button");
  removeFavoriteButton.textContent = "remove from favorite";
  removeFavoriteButton.onclick = function () {
    const favoriteContacts = state.favoriteContacts.filter(
      ({ id }) => id != props.id
    );
    setState({ favoriteContacts });
  };

  const isFavorite = state.favoriteContacts.some(({ id }) => props.id === id);

  const item = document.createElement("li");
  item.appendChild(name);
  item.appendChild(email);
  item.appendChild(isFavorite ? removeFavoriteButton : addFavoriteButton);

  return item;
}

function FavoriteContactsScreen() {
  const title = document.createElement("h1");
  title.textContent = "Favorite Contacts";

  const list = document.createElement("ol");
  list.append(
    ...state.favoriteContacts.map((contact) =>
      ContactListItem({
        id: contact.id,
        firstName: contact.firstName,
        maidenName: contact.maidenName,
        lastName: contact.lastName,
        email: contact.email,
      })
    )
  );

  const emptyText = document.createElement("p");
  emptyText.textContent = "No data found";

  const wrapper = document.createElement("div");
  wrapper.appendChild(Navbar());
  wrapper.appendChild(title);

  if (state.favoriteContacts.length === 0) {
    wrapper.appendChild(emptyText);
  } else {
    wrapper.appendChild(list);
  }

  return wrapper;
}

function HomeScreen() {
  const title = document.createElement("h1");
  title.textContent = "Welcome to Home Page";

  const list = document.createElement("ol");
  list.append(
    ...state.contacts.map((contact) =>
      ContactListItem({
        id: contact.id,
        firstName: contact.firstName,
        maidenName: contact.maidenName,
        lastName: contact.lastName,
        email: contact.email,
      })
    )
  );

  const input = document.createElement("input");
  input.id = "search";
  input.placeholder = "Search a name";
  input.value = state.inputValue;
  input.oninput = function (event) {
    const value = event.target.value;
    setState({ inputValue: value });
  };

  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset";
  resetButton.onclick = function () {
    setState({ inputValue: "" });
  };

  const emptyText = document.createElement("p");
  emptyText.textContent = "No data found";

  const errorText = document.createElement("p");
  errorText.textContent = state.errorMessage;

  const loadingText = document.createElement("p");
  loadingText.textContent = "Loading...";

  const wrapper = document.createElement("div");
  wrapper.appendChild(Navbar());
  wrapper.appendChild(title);
  wrapper.appendChild(input);
  wrapper.appendChild(resetButton);

  if (state.isLoading) {
    wrapper.appendChild(loadingText);
  } else if (state.errorMessage !== "") {
    wrapper.appendChild(errorText);
  } else if (state.contacts.length === 0) {
    wrapper.appendChild(emptyText);
  } else {
    wrapper.appendChild(list);
  }

  return wrapper;
}

function AboutScreen() {
  const title = document.createElement("h1");
  title.textContent = "About Me";

  const description = document.createElement("p");
  description.textContent = "This is about page";

  const wrapper = document.createElement("div");
  wrapper.appendChild(Navbar());
  wrapper.appendChild(title);
  wrapper.appendChild(description);

  return wrapper;
}

function NotFoundScreen() {
  const title = document.createElement("h1");
  title.textContent = "Not Found";
  return title;
}

function App() {
  const homeScreen = HomeScreen();
  const aboutScreen = AboutScreen();
  const notFoundScreen = NotFoundScreen();
  const favoriteContactsScreen = FavoriteContactsScreen();

  if (state.path == "/") {
    return homeScreen;
  } else if (state.path == "/about") {
    return aboutScreen;
  } else if (state.path == "/favorite-contacts") {
    return favoriteContactsScreen;
  } else {
    return notFoundScreen;
  }
}

function render() {
  const focusedElementId = document.activeElement.id;
  const focusedElementSelectionStart = document.activeElement.selectionStart;
  const focusedElementSelectionEnd = document.activeElement.selectionEnd;

  const root = document.getElementById("root");
  const app = App();
  root.innerHTML = "";
  root.appendChild(app);

  if (focusedElementId) {
    const focusedElement = document.getElementById(focusedElementId);
    focusedElement.focus();
    focusedElement.selectionStart = focusedElementSelectionStart;
    focusedElement.selectionEnd = focusedElementSelectionEnd;
  }
}

render();
onStateChange({}, state);
