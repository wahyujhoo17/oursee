"use client";

import { useState, useEffect, useRef } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Image,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Radio,
  Card,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  InfoCircleOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useUploadThing } from "@/lib/uploadthing";

interface Product {
  id: string;
  productCode: string;
  name: string;
  description?: string;
  price?: number;
  images: { imageUrl: string; isMain: boolean }[];
  categories: { category: { name: string } }[];
}

interface UploadedImage {
  url: string;
  isMain: boolean;
  key?: string; // file key untuk delete
}

// Browser-compatible image compression using Canvas API
async function compressImageBrowser(file: File): Promise<File> {
  const MAX_SIZE_KB = 200;
  const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920;

        // Resize jika terlalu besar
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try different quality levels
        let quality = 0.9;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to compress image"));
                return;
              }

              if (blob.size <= MAX_SIZE_BYTES || quality <= 0.1) {
                const compressedFile = new File(
                  [blob],
                  file.name.replace(/\.[^.]+$/, ".webp"),
                  {
                    type: "image/webp",
                    lastModified: Date.now(),
                  },
                );

                const originalSizeKB = (file.size / 1024).toFixed(2);
                const compressedSizeKB = (compressedFile.size / 1024).toFixed(
                  2,
                );
                console.log(
                  `Image compressed: ${originalSizeKB}KB → ${compressedSizeKB}KB`,
                );

                resolve(compressedFile);
              } else {
                quality -= 0.1;
                tryCompress();
              }
            },
            "image/webp",
            quality,
          );
        };

        tryCompress();
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [form] = Form.useForm();

  // Upload refs/state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const { startUpload } = useUploadThing("imageUploader");

  useEffect(() => {
    fetchProducts(1, 10);
    fetchCategories();
  }, []);

  const fetchProducts = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?page=${page}&limit=${limit}`);
      const data = await res.json();
      setProducts(data.data || []);
      setPagination({
        current: data.pagination.page,
        pageSize: data.pagination.limit,
        total: data.pagination.total,
      });
    } catch (error) {
      message.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      message.error("Failed to fetch categories");
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Delete Product",
      content: "Are you sure you want to delete this product?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await fetch(`/api/products/${id}`, { method: "DELETE" });
          message.success("Product deleted");
          fetchProducts(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error("Failed to delete product");
        }
      },
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setUploadedImages(
      product.images.map((img) => {
        // Extract file key from URL
        const match = img.imageUrl.match(/\/f\/([^\/]+)$/);
        return {
          url: img.imageUrl,
          isMain: img.isMain,
          key: match ? match[1] : undefined,
        };
      }),
    );
    form.setFieldsValue({
      name: product.name,
      description: product.description,
      price: product.price,
      productCode: product.productCode,
      categoryNames: product.categories.map((c) => c.category.name),
    });
    setModalOpen(true);
  };

  const handleModalClose = async (isSubmitSuccess = false) => {
    // Only delete files if user cancelled (not submitted successfully)
    if (!isSubmitSuccess) {
      // If editing and user cancels, delete newly uploaded images that weren't saved
      if (editingProduct && uploadedImages.length > 0) {
        const originalImageUrls = editingProduct.images.map(
          (img) => img.imageUrl,
        );
        const newImageKeys = uploadedImages
          .filter((img) => !originalImageUrls.includes(img.url))
          .map((img) => img.key)
          .filter((key): key is string => key !== undefined);

        if (newImageKeys.length > 0) {
          try {
            await fetch("/api/uploadthing/delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fileKeys: newImageKeys }),
            });
            console.log(
              "Deleted unsaved files from UploadThing:",
              newImageKeys.length,
            );
          } catch (error) {
            console.error("Failed to delete unsaved files:", error);
          }
        }
      } else if (!editingProduct && uploadedImages.length > 0) {
        // If adding new product and user cancels, delete all uploaded images
        const allKeys = uploadedImages
          .map((img) => img.key)
          .filter((key): key is string => key !== undefined);

        if (allKeys.length > 0) {
          try {
            await fetch("/api/uploadthing/delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fileKeys: allKeys }),
            });
            console.log(
              "Deleted all unsaved files from UploadThing:",
              allKeys.length,
            );
          } catch (error) {
            console.error("Failed to delete unsaved files:", error);
          }
        }
      }
    }

    setModalOpen(false);
    setEditingProduct(null);
    setUploadedImages([]);
    form.resetFields();
  };

  const handleCancel = () => {
    handleModalClose(false);
  };

  const generateProductCode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `PROD-${timestamp}-${random}`;
  };

  const handleAddProduct = () => {
    const productCode = generateProductCode();
    form.setFieldsValue({ productCode });
    setModalOpen(true);
  };

  const setMainImage = (index: number) => {
    const newImages = uploadedImages.map((img, idx) => ({
      ...img,
      isMain: idx === index,
    }));
    setUploadedImages(newImages);
  };

  const removeImage = async (index: number) => {
    const imageToRemove = uploadedImages[index];
    const newImages = uploadedImages.filter((_, idx) => idx !== index);

    if (imageToRemove.isMain && newImages.length > 0) {
      newImages[0].isMain = true;
    }

    setUploadedImages(newImages);

    if (imageToRemove.key) {
      try {
        await fetch("/api/uploadthing/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileKeys: [imageToRemove.key] }),
        });
        console.log("File deleted from UploadThing:", imageToRemove.key);
      } catch (error) {
        console.error("Failed to delete file from UploadThing:", error);
        // Continue anyway, file will be orphaned but won't break functionality
      }
    }
  };

  const handleSubmit = async (values: any) => {
    if (uploadedImages.length === 0) {
      message.error("Please upload at least one image");
      return;
    }

    const hasMainImage = uploadedImages.some((img) => img.isMain);
    if (!hasMainImage) {
      message.error("Please select a thumbnail image");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...values,
        images: uploadedImages,
      };

      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save product");

      message.success(editingProduct ? "Product updated!" : "Product created!");
      handleModalClose(true); // Pass true to indicate successful submit
      fetchProducts(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Product> = [
    {
      title: "Image",
      dataIndex: "images",
      key: "image",
      width: 100,
      render: (images) => {
        const mainImage = images?.find((img: any) => img.isMain);
        return mainImage ? (
          <Image
            src={mainImage.imageUrl}
            alt="Product"
            width={60}
            height={60}
          />
        ) : (
          <div className="w-15 h-15 bg-gray-200 flex items-center justify-center text-gray-400">
            No Image
          </div>
        );
      },
    },
    {
      title: "Product Code",
      dataIndex: "productCode",
      key: "productCode",
      width: 150,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => (price ? `Rp ${price.toLocaleString()}` : "-"),
    },
    {
      title: "Categories",
      dataIndex: "categories",
      key: "categories",
      render: (categories) => (
        <>
          {categories?.map((c: any, idx: number) => (
            <Tag key={idx} color="blue">
              {c.category.name}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="px-2 sm:px-0">
      <div className="flex flex-wrap justify-between items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Products Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddProduct}
          size="middle"
          className="w-full sm:w-auto"
        >
          Add Product
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} products`,
        }}
        onChange={(pagination) => {
          fetchProducts(pagination.current, pagination.pageSize);
        }}
        scroll={{ x: 800 }}
      />

      <Modal
        title={
          <div className="text-base sm:text-lg font-semibold">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </div>
        }
        open={modalOpen}
        onCancel={handleCancel}
        footer={null}
        width="95%"
        style={{ top: 20, maxWidth: 900 }}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="border border-gray-200 p-3 sm:p-5 rounded-lg mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <InfoCircleOutlined /> Product Information
            </h3>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="productCode"
                  label="Product Code"
                  tooltip="Auto-generated but editable"
                  rules={[{ required: true, message: "Product code required" }]}
                >
                  <Input placeholder="PROD-xxxxx" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="price"
                  label="Price (Rp)"
                  tooltip="Leave empty if price varies"
                >
                  <InputNumber
                    className="w-full"
                    size="large"
                    placeholder="Enter price (e.g., 100000)"
                    min={0}
                    precision={0}
                    formatter={(value) =>
                      value
                        ? `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        : ""
                    }
                    parser={(value) => value!.replace(/Rp\s?|(,*)/g, "") as any}
                    style={{ fontSize: "15px", width: "100%" }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="name"
              label="Product Name"
              rules={[{ required: true, message: "Please enter product name" }]}
            >
              <Input placeholder="Beautiful Rose Bouquet" size="large" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              tooltip="Detailed product description"
            >
              <Input.TextArea
                rows={3}
                placeholder="Describe your product in detail..."
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Form.Item
              name="categoryNames"
              label="Categories"
              tooltip="Select existing or type new category name"
              rules={[
                {
                  required: true,
                  message: "Please add at least one category",
                },
              ]}
            >
              <Select
                mode="tags"
                size="large"
                placeholder="Type or select categories (e.g., Wedding, Birthday)"
                tokenSeparators={[","]}
                options={categories.map((cat) => ({
                  label: cat.name,
                  value: cat.name,
                }))}
              />
            </Form.Item>
          </div>

          <div className="border border-gray-200 p-3 sm:p-5 rounded-lg mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <PictureOutlined /> Product Images
            </h3>
            <Form.Item
              label="Upload Images"
              required
              tooltip="Upload multiple images, set one as thumbnail"
            >
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      setUploading(true);
                      try {
                        const fileArray = Array.from(files);

                        // Compress each image before uploading
                        message.loading("Compressing images...", 0);
                        const compressedFiles: File[] = [];
                        for (const file of fileArray) {
                          try {
                            const compressed = await compressImageBrowser(file);
                            compressedFiles.push(compressed);
                          } catch (error) {
                            console.error(
                              "Failed to compress:",
                              file.name,
                              error,
                            );
                            message.error(`Failed to compress ${file.name}`);
                          }
                        }
                        message.destroy();

                        if (compressedFiles.length === 0) {
                          message.error(
                            "No images were compressed successfully",
                          );
                          return;
                        }

                        message.loading("Uploading images...", 0);
                        const res = await startUpload(compressedFiles);
                        message.destroy();

                        if (res) {
                          // Extract URL and key from response
                          const newImages = (res as any[]).map((f) => {
                            const url = f.file?.url ?? f.url ?? f.fileUrl ?? "";
                            // Extract key from URL
                            const match = url.match(/\/f\/([^\/]+)$/);
                            return {
                              url,
                              isMain: uploadedImages.length === 0,
                              key: match ? match[1] : undefined,
                            };
                          });
                          setUploadedImages((prev) => [...prev, ...newImages]);
                          message.success(`${res.length} image(s) uploaded!`);
                        }
                      } catch (err) {
                        message.destroy();
                        message.error("Upload failed");
                        console.error("Upload error:", err);
                      } finally {
                        setUploading(false);
                        // Safely reset input value
                        if (e.target && e.target.value) {
                          e.target.value = "";
                        }
                      }
                    }}
                  />

                  <div className="flex justify-center">
                    <Button
                      type="dashed"
                      onClick={() => fileInputRef.current?.click()}
                      loading={uploading}
                    >
                      Upload Images
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Supports: JPG, PNG, WebP (Auto-compressed to max 500KB per
                    file)
                  </p>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-700">
                        Uploaded Images ({uploadedImages.length})
                      </p>
                      <p className="text-xs text-gray-500 hidden sm:block">
                        Click star icon to set as thumbnail
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {uploadedImages.map((img, index) => (
                        <Card
                          key={index}
                          className="relative hover:shadow-lg transition-shadow"
                          cover={
                            <div className="relative">
                              <img
                                src={img.url}
                                alt={`Product ${index + 1}`}
                                className="h-24 sm:h-32 object-cover w-full"
                              />
                              {img.isMain && (
                                <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold shadow-md">
                                  THUMBNAIL
                                </div>
                              )}
                            </div>
                          }
                        >
                          <div className="flex gap-2">
                            <Button
                              type={img.isMain ? "primary" : "default"}
                              icon={
                                img.isMain ? <StarFilled /> : <StarOutlined />
                              }
                              size="small"
                              onClick={() => setMainImage(index)}
                              block
                            />
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              size="small"
                              onClick={() => removeImage(index)}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Form.Item>
          </div>

          <Form.Item className="mb-0">
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
              <Button
                size="large"
                onClick={handleCancel}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                icon={editingProduct ? <EditOutlined /> : <PlusOutlined />}
                className="w-full sm:w-auto"
              >
                {editingProduct ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
