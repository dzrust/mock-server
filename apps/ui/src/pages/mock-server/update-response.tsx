import { Formik } from "formik";
import { FC, useState } from "react";
import { Button, Container, Form, Modal } from "react-bootstrap";
import SvelteJSONEditor from "../../components/json-editor";
import { useAppDispatch } from "../../hooks";
import { createError } from "../../models/notification";
import { Response, responseFormModel, ResponseFormModelType } from "../../models/response";
import { useUpdateResponseMutation } from "../../services/routes";
import { addNotification } from "../../slice/app-slice";

type Props = {
  response: Response;
  close: () => void;
};

const UpdateResponseModal: FC<Props> = ({ response, close }) => {
  const dispatch = useAppDispatch();
  const [update] = useUpdateResponseMutation();
  const [content, setContent] = useState({
    json: undefined,
    text: JSON.stringify(response.response),
  });
  const onSubmit = (values: ResponseFormModelType) =>
    update({
      id: response.id,
      ...values,
      response: JSON.parse(content.text ?? "{}"),
      routeId: response.routeId,
    })
      .then(close)
      .catch(() => {
        dispatch(addNotification(createError("Failed to update response")));
      });

  return (
    <Formik
      onSubmit={onSubmit}
      initialValues={
        {
          name: response.name,
          statusCode: response.statusCode,
          response: response.response,
          headers: response.headers,
        } as ResponseFormModelType
      }
      enableReinitialize
      validationSchema={responseFormModel}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <Modal show onHide={close} size="lg">
          <Modal.Header>
            <h2>{response.name}</h2>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  name="name"
                  placeholder="Name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={!!errors.name && !!touched.name}
                  disabled={!!response.postmanId}
                />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status Code</Form.Label>
                <Form.Control
                  name="statusCode"
                  placeholder="statusCode"
                  type="number"
                  value={values.statusCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={!!errors.statusCode && !!touched.statusCode}
                  disabled={!!response.postmanId}
                />
                <Form.Control.Feedback type="invalid">{errors.statusCode}</Form.Control.Feedback>
              </Form.Group>
              <p>Format: (ctrl+I) or (cmd+I)</p>
              <SvelteJSONEditor
                mainMenuBar={false}
                mode="code"
                content={content}
                onChange={!!response.postmanId ? () => {} : (setContent as any)}
              />
              <div className="mt-3" />
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={close} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              onClick={() => handleSubmit()}
              disabled={!!response.postmanId || isSubmitting}
            >
              Submit
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Formik>
  );
};

export default UpdateResponseModal;
