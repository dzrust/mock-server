import React, { FC } from "react";
import { Container, Nav, Navbar, NavbarBrand } from "react-bootstrap";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Error from "./components/error";
import Loader from "./components/loader";
import { useAppSelector } from "./hooks";
import RoutesPage from "./pages/mock-server/routes";
import SyncPage from "./pages/sync-postman/sync";
import { isLoading as getIsLoading } from "./slice/app-slice";

import "./styles/app.css";

const App: FC = () => {
  const isLoading = useAppSelector(getIsLoading);
  return (
    <BrowserRouter>
      <Navbar bg="dark" variant="dark" fixed="top" collapseOnSelect expand="lg">
        <Container>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav>
              <NavbarBrand>Mock Server</NavbarBrand>
              <Nav.Link as={Link} to="/">
                Routes
              </Nav.Link>
              <Nav.Link as={Link} to="/sync">
                Postman Sync
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="app-container" fluid>
        {isLoading ? <Loader /> : null}
        <Error />
        <Routes>
          <Route path="/" element={<RoutesPage />} />
          <Route path="/sync" element={<SyncPage />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
};

export default App;
