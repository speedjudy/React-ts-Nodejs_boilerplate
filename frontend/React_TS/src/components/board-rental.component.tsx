import React, { useEffect } from "react";
import RentalService from "../services/rental.service";
import ImageUploading, { ImageListType } from "react-images-uploading";

export function BoardRental() {
  const [images, setImages] = React.useState([]);
  const [data, setData] = React.useState([]);
  const [flag, setFlag] = React.useState([] as any);
  const [name, setNameChange] = React.useState([] as any);
  const [addr, setAddrChange] = React.useState([] as any);

  const [baseImage, setImagesBase] = React.useState([] as any);

  const maxNumber = 69;

  useEffect(() => {
    getDataRental();
  }, [])
  const logined = sessionStorage.getItem("user");
  const getDataRental = () => {
    setFlag("Save");
    RentalService.getRental(

    ).then(
      response => {
        console.log(response);
        setData(response.data);
      },
      error => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
      }
    );
  }
  const onChange = (
    imageList: ImageListType,
    addUpdateIndex: number[] | undefined
  ) => {
    // data for submit
    setImages(imageList as never[]);

    setImagesBase(imageList[0].dataURL);

    console.log(imageList, addUpdateIndex, baseImage);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value)
    setNameChange(e.target.value);
    // No longer need to cast to any - hooray for react!
  }
  const handleAddrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value)
    setAddrChange(e.target.value);

    // No longer need to cast to any - hooray for react!
  }
  const handleRemove = (e: any) => {
    console.log(e.target.id);
    RentalService.removeRental(
      e.target.id
    ).then(
      response => {
        console.log(response);
        getDataRental();
      },
      error => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
      }
    );

  }
  const handleEdit = (e: any) => {
    let id = e.target.id;
    for (let i = 0; i < data.length; i++) {
      if (data[i]['_id']==id) {
          setNameChange(data[i]['name']);
          setAddrChange(data[i]['address']);
          setImagesBase(data[i]['image']);
          setFlag(id);
      }
    }
    console.log(data, id);
  }
  const handleSave = () => {
    console.log(baseImage, name, addr, flag);
    RentalService.addRental(
      name,
      addr,
      baseImage,
      flag
    ).then(
      response => {
        console.log(response);
        if (response.data.state == "success") {
          setNameChange("");
          setAddrChange("");
          setImagesBase("");
          setImages([]);
          getDataRental();
        }
      },
      error => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
      }
    );
  }
  return (
    <div className="App">
      <div className={(logined) ? "hide" : "show"}>Not permit</div>
      <div className={(logined) ? "show" : "hide"}>
        <ImageUploading
          value={images}
          onChange={onChange}
          maxNumber={maxNumber}
        >
          {({
            imageList,
            onImageUpload,
            onImageRemoveAll,
            onImageUpdate,
            onImageRemove,
            isDragging,
            dragProps
          }) => (
            // write your building UI
            <div className="upload__image-wrapper" style={{ display: "inline-flex" }}>
              <button
                style={isDragging ? { color: "red" } : undefined}
                onClick={onImageUpload}
                {...dragProps}
              >
                Image Upload
              </button>
              &nbsp;
              {imageList.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image.dataURL} alt="" width="100" />
                  <div className="image-item__btn-wrapper">
                    {/* <button onClick={() => onImageUpdate(index)}>Update</button>
                    <button onClick={() => onImageRemove(index)}>Remove</button> */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ImageUploading>
        Name: <input type="text" value={name} onChange={handleNameChange} />
        Address: <input type="text" value={addr} onChange={handleAddrChange} />
        <button onClick={handleSave}>Save</button>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>No</th>
              <th>Name</th>
              <th>Addr</th>
              <th>Image</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((obj, index) => (
              <tr key={index} className="image-item">
                <td>{index + 1}</td>
                <td>{obj['name']}</td>
                <td>{obj['address']}</td>
                <td><img src={obj['image']} alt="" width="100" /></td>
                <td><button id={obj['_id']} onClick={handleRemove}>Remove</button><button id={obj['_id']} onClick={handleEdit}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
