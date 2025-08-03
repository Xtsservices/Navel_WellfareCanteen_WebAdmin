import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Row,
  Col,
  Typography,
  message,
  InputNumber,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import Loader from "../../components/common/loader";
import { toastError, toastSuccess } from "../../components/common/toasterMessage";
import { itemService } from "../../auth/apiService";

const { Option } = Select;
const { Text } = Typography;
const { TextArea } = Input;

interface ItemProps {
  id: number;
  name: string;
  description: string;
  type: string;
  quantity: number;
  quantityUnit: string;
  price: number;
  currency: string;
  startDate: string;
  endDate: string;
  image: string;
  status: string;
}

interface AddItemModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  onSuccess: () => void;
  selectedItem?: ItemProps;
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onCancel,
  onSubmit,
  onSuccess,
  selectedItem,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const editMode = !!selectedItem;

  useEffect(() => {
    if (isOpen && selectedItem) {
      // Pre-fill form with selectedItem data
      form.setFieldsValue({
        id: selectedItem.id,
        name: selectedItem.name,
        type: selectedItem.type,
        description: selectedItem.description,
        quantity: selectedItem.quantity,
        quantityUnit: selectedItem.quantityUnit,
        price: selectedItem.price,
        startDate: dayjs.unix(Number(selectedItem.startDate)),
        endDate: dayjs.unix(Number(selectedItem.endDate)),
        imageUrl: selectedItem.image,
      });
    } else if (isOpen) {
      // Reset form for add mode
      form.resetFields();
    }
  }, [isOpen, selectedItem, form]);

  const handleCancel = () => {
    setErrorDetails(null);
    form.resetFields();
    onCancel();
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      setErrorDetails(null);
      const values = await form.validateFields();

      // Create a plain object instead of FormData
      const itemData: any = {
        type: values.type.trim(),
        description: values.description.trim(),
        quantity: values.quantity,
        quantityUnit: values.quantityUnit,
        price: values.price,
        image: values.imageUrl.trim(),
        startDate: values.startDate ? values.startDate.format("DD-MM-YYYY") : undefined,
        endDate: values.endDate ? values.endDate.format("DD-MM-YYYY") : undefined,
      };

      // Add mode: Include name
      if (!editMode) {
        itemData.name = values.name.trim();
      }

      // Edit mode: Include id
      if (editMode && values.id) {
        itemData.id = values.id;
      }

      // Log itemData for debugging
      console.log("Item data:", itemData);

      if (editMode && selectedItem) {
        await itemService.updateItem(itemData);
        toastSuccess("Item updated successfully!");
      } else {
        await itemService.createItem(itemData);
        toastSuccess("Item added successfully!");
      }

      form.resetFields();
      onSubmit(values);
      onSuccess();
      handleCancel();
    } catch (error: any) {
      const errorMessage = editMode ? "Failed to update item." : "Failed to add item.";
      toastError(`${errorMessage} Please try again.`);
      setErrorDetails(error.message || errorMessage);
      console.error(`${errorMessage}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const formItemStyle = {
    marginBottom: "16px",
  };

  const inputStyle = {
    width: "100%",
    height: "40px",
  };

  // Custom validation for URL
  const validateImageUrl = (_: any, value: string) => {
    if (!value || value.trim() === "") {
      return Promise.reject("Please enter an image URL");
    }
    const urlPattern = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;
    if (!urlPattern.test(value)) {
      return Promise.reject("Please enter a valid URL");
    }
    return Promise.resolve();
  };

  // Disallow past dates for start date
  const disablePastDate = (current: Dayjs) => {
    return current && current.isBefore(dayjs().startOf("day"));
  };

  // Ensure end date is after start date
  const disableInvalidEndDate = (current: Dayjs) => {
    const startDate = form.getFieldValue("startDate");
    if (!startDate) {
      return false;
    }
    return current && current.isBefore(startDate);
  };

  return (
    <Modal
      className={`add-item-modal ${loading ? "loader-container" : ""}`}
      title={editMode ? "Edit Menu Item" : "Add Menu Item"}
      open={isOpen}
      onCancel={handleCancel}
      width={920}
      centered
      footer={null}
      styles={{
        body: { maxHeight: "75vh", overflowY: "auto", padding: "24px" },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="add_item_form"
        style={{ background: "white" }}
      >
        {/* Hidden Form.Item for id */}
        <Form.Item name="id" hidden>
          <Input type="hidden" />
        </Form.Item>

        <Row gutter={24}>
          <Col xs={24} sm={12} style={{ marginBottom: "16px" }}>
            <Form.Item
              name="name"
              label="Item Name"
              rules={[
                { required: true, message: "Please enter item name" },
                {
                  min: 3,
                  message: "Item name must be at least 3 characters",
                },
                {
                  max: 50,
                  message: "Item name cannot exceed 50 characters",
                },
                {
                  whitespace: true,
                  message: "Item name cannot be empty spaces",
                },
              ]}
              style={formItemStyle}
            >
              <Input
                placeholder="Enter Item name"
                style={inputStyle}
                disabled={editMode}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} style={{ marginBottom: "16px" }}>
            <Form.Item
              name="type"
              label="Item Type"
              rules={[{ required: true, message: "Please select item type" }]}
              style={formItemStyle}
            >
              <Select
                placeholder="Select Type"
                style={inputStyle}
                disabled={editMode}
              >
                <Option value="veg">Vegetarian</Option>
                <Option value="non-veg">Non-Vegetarian</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24}>
            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please enter item description" },
                {
                  min: 10,
                  message: "Description must be at least 10 characters",
                },
                {
                  max: 200,
                  message: "Description cannot exceed 200 characters",
                },
              ]}
              style={formItemStyle}
            >
              <TextArea
                placeholder="Enter item description"
                rows={2}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} sm={8} style={{ marginBottom: "16px" }}>
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[
                { required: true, message: "Please enter quantity" },
                {
                  type: "number",
                  min: 1,
                  message: "Quantity must be at least 1",
                },
              ]}
              style={formItemStyle}
            >
              <InputNumber
                placeholder="Enter quantity"
                style={{ width: "100%", height: "40px" }}
                min={1}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8} style={{ marginBottom: "16px" }}>
            <Form.Item
              name="quantityUnit"
              label="Unit"
              rules={[{ required: true, message: "Please select unit" }]}
              style={formItemStyle}
            >
              <Select placeholder="Select Unit" style={inputStyle}>
                <Option value="grams">grams</Option>
                <Option value="ml">ml</Option>
                <Option value="pieces">pieces</Option>
                <Option value="cups">cups</Option>
                <Option value="packets">packets</Option>
                <Option value="plates">plates</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8} style={{ marginBottom: "16px" }}>
            <Form.Item
              name="price"
              label="Price (₹)"
              rules={[
                { required: true, message: "Please enter price" },
                {
                  type: "number",
                  min: 0,
                  message: "Price cannot be negative",
                },
              ]}
              style={formItemStyle}
            >
              <InputNumber
                placeholder="Enter price"
                style={{ width: "100%", height: "40px" }}
                min={0}
                step={0.01}
                precision={2}
                formatter={(value) => `₹ ${value}`}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} sm={12} style={{ marginBottom: "16px" }}>
            <Form.Item
              name="startDate"
              label="Available From"
              rules={[{ required: true, message: "Please select start date" }]}
              style={formItemStyle}
            >
              <DatePicker
                placeholder="DD-MM-YYYY"
                style={inputStyle}
                format="DD-MM-YYYY"
                disabledDate={disablePastDate}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} style={{ marginBottom: "16px" }}>
            <Form.Item
              name="endDate"
              label="Available Until"
              rules={[{ required: true, message: "Please select end date" }]}
              style={formItemStyle}
              dependencies={["startDate"]}
            >
              <DatePicker
                placeholder="DD-MM-YYYY"
                style={inputStyle}
                format="DD-MM-YYYY"
                disabledDate={disableInvalidEndDate}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24}>
            <Form.Item
              name="imageUrl"
              label="Item Image URL"
              rules={[
                { required: true, message: "Please enter an image URL" },
                { validator: validateImageUrl },
              ]}
              style={formItemStyle}
            >
              <Input
                placeholder="Enter image URL (e.g., https://example.com/image)"
                style={inputStyle}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row
          style={{
            marginTop: "24px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Col
            xs={24}
            sm={12}
            md={8}
            style={{ marginLeft: "10px", marginRight: "10px" }}
          >
            <Button
              type="primary"
              block
              onClick={handleOk}
              loading={loading}
              style={{ height: "40px" }}
            >
              {editMode ? "Update Item" : "Add Item"}
            </Button>
          </Col>
          <Col
            xs={24}
            sm={12}
            md={8}
            style={{
              textAlign: "center",
              marginLeft: "10px",
              marginRight: "10px",
            }}
          >
            <Button
              type="default"
              onClick={handleCancel}
              style={{ height: "40px", width: "100%" }}
              disabled={loading}
            >
              Cancel
            </Button>
          </Col>
        </Row>
        {errorDetails && (
          <Row style={{ marginTop: "16px" }}>
            <Col span={24}>
              <div
                className="error-message"
                style={{
                  padding: "10px",
                  background: "#ffecec",
                  border: "1px solid #ff4d4f",
                  borderRadius: "4px",
                  color: "#ff4d4f",
                }}
              >
                <strong>Error Details:</strong> {errorDetails}
              </div>
            </Col>
          </Row>
        )}
      </Form>
      {loading && <Loader />}
    </Modal>
  );
};

export default AddItemModal;