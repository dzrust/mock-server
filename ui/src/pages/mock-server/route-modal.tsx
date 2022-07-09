import { Formik } from "formik";
import React, { FC } from "react";
import { Button, Col, Container, Form, Modal, Row, Table } from "react-bootstrap";
import { useAppDispatch } from "../../hooks";
import { Response } from "../../models/response";
import { Route, routeFormModel, RouteFormModelType } from "../../models/route";
import { useCreateResponseMutation, useGetResponsesQuery, useUpdateRouteMutation } from "../../services/routes";
import { setError } from "../../slice/app-slice";

type Props = {
  route: Route;
  close: () => void;
  setResponse: (response?: Response) => void;
};

const RouteModal: FC<Props> = ({ route, close, setResponse }) => {
  const dispatch = useAppDispatch();
  const { data, refetch } = useGetResponsesQuery(route.id);
  const [create] = useCreateResponseMutation();
  const [updateRoute] = useUpdateRouteMutation();
  const createResponse = () =>
    create({
      name: "New Response",
      statusCode: 404,
      response: {},
      headers: {},
      routeId: route.id,
    })
      .then(refetch)
      .catch(() => {
        refetch();
        dispatch(setError("Failed to create new response"));
      });
  const setActiveResponse = (response: Response) =>
    updateRoute({
      ...route,
      currentExampleId: response.id,
    })
      .then(refetch)
      .catch(() => {
        refetch();
        dispatch(setError("Failed to set response to active"));
      });
  const onSubmit = (values: RouteFormModelType) =>
    updateRoute({
      ...route,
      ...values,
      method: values.method.toUpperCase(),
    })
      .then(close)
      .catch(() => {
        refetch();
        dispatch(setError("Failed to update route"));
      });
  return (
    <Formik
      onSubmit={onSubmit}
      initialValues={
        {
          name: route.name,
          url: route.url,
          method: route.method,
        } as RouteFormModelType
      }
      validationSchema={routeFormModel}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <Modal show onHide={close} size="lg">
          <Modal.Header>
            <h2>{route.name}</h2>
            <Button onClick={createResponse} variant="primary">
              Add Response
            </Button>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      name="name"
                      placeholder="Name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={!!errors.name && !!touched.name}
                      disabled={!!route.postmanId}
                    />
                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                  </Form.Group>
                  <p>Default URL: {route.defaultUrl}</p>
                  <Form.Group className="mb-3">
                    <Form.Label>Url</Form.Label>
                    <Form.Control
                      name="url"
                      placeholder="Url"
                      value={values.url}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={!!errors.url && !!touched.url}
                    />
                    <Form.Control.Feedback type="invalid">{errors.url}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Method</Form.Label>
                    <Form.Control
                      name="method"
                      placeholder="Method"
                      value={values.method}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={!!errors.method && !!touched.method}
                      disabled={!!route.postmanId}
                    />
                    <Form.Control.Feedback type="invalid">{errors.method}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Table hover>
                    <thead>
                      <tr>
                        <td>Name</td>
                        <td>Status Code</td>
                        <td>Edit</td>
                        <td>Active Response</td>
                      </tr>
                    </thead>
                    <tbody>
                      {(data ?? []).map((row) => (
                        <tr key={row.id}>
                          <td>{row.name}</td>
                          <td>{row.statusCode}</td>
                          <td>
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setResponse(row);
                                close();
                              }}
                            >
                              Edit
                            </Button>
                          </td>
                          <td>
                            {route.currentExampleId === row.id ? (
                              "Active Response"
                            ) : (
                              <Button variant="primary" onClick={() => setActiveResponse(row)}>
                                Set Active
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={close} disabled={isSubmitting}>
              Close
            </Button>
            <Button variant="primary" type="submit" onClick={() => handleSubmit()} disabled={isSubmitting}>
              Submit
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Formik>
  );
};

export default RouteModal;
