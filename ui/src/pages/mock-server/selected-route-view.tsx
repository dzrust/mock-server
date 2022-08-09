import { faUserAstronaut } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Formik } from "formik";
import React, { FC, Fragment } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { useAppDispatch } from "../../hooks";
import { createError } from "../../models/notification";
import { Response } from "../../models/response";
import { Route, routeFormModel, RouteFormModelType } from "../../models/route";
import { useCreateResponseMutation, useGetResponsesQuery, useUpdateRouteMutation } from "../../services/routes";
import { addNotification } from "../../slice/app-slice";

type Props = {
  route: Route;
  setResponse: (response?: Response) => void;
};

const SelectedRouteView: FC<Props> = ({ route, setResponse }) => {
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
        dispatch(addNotification(createError("Failed to create new response")));
      });
  const setActiveResponse = (response: Response) =>
    updateRoute({
      ...route,
      currentExampleId: response.id,
    })
      .then(refetch)
      .catch(() => {
        refetch();
        dispatch(addNotification(createError("Failed to set response to active")));
      });
  const onSubmit = (values: RouteFormModelType) =>
    updateRoute({
      ...route,
      ...values,
      method: values.method.toUpperCase(),
    })
      .then()
      .catch(() => {
        refetch();
        dispatch(addNotification(createError("Failed to update route")));
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
      enableReinitialize
      validationSchema={routeFormModel}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <Fragment>
          <Row>
            <Col>
              {!!route.postmanId ? (
                <FontAwesomeIcon icon={faUserAstronaut} title="Postman API" fixedWidth size="2x" />
              ) : null}
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
              <Button variant="primary" type="submit" onClick={() => handleSubmit()} disabled={isSubmitting}>
                Save
              </Button>
            </Col>
          </Row>
          <hr />
          <Row>
            <Col>
              <h2>Responses</h2>
            </Col>
            <Col>
              <Button onClick={createResponse} variant="primary">
                Add Response
              </Button>
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
        </Fragment>
      )}
    </Formik>
  );
};

export default SelectedRouteView;
