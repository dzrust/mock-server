import React, { FC } from "react";
import { Container, Nav, Navbar, NavbarBrand } from "react-bootstrap";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import RoutesPage from "./pages/mock-server/routes";
import SyncPage from "./pages/sync-postman/sync";

import "./styles/app.css";

const App: FC = () => {
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
      <Container className="app-container">
        <Routes>
          <Route path="/" element={<RoutesPage />} />
          <Route path="/sync" element={<SyncPage />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
};

export default App;
