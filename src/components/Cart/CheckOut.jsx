import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux'
import { toastr } from 'react-redux-toastr';
import { Link, useNavigate } from 'react-router-dom';
import { addDetailBill } from '../../api/detailOrder';
import { add } from '../../api/infoOder';
import { list, read } from '../../api/voucher';
import { numberFormat } from '../../config/numberFormat';
import { resetCart } from '../../features/Cart/cartSlice';
import { updateVoucher } from '../../features/Voucher/voucher';

const CheckOut = () => {
    const [valueVoucher, setValueVoucher] = useState("")
    let [priceVoucher, setPriceVoucher] = useState(0)
    const { register, handleSubmit, formState: { errors } } = useForm()
    let totalCart = 0;
    const dataCart = useSelector(data => data.cart.items);
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const addOder = (value) => {
        let infoOder = []
        if (localStorage.getItem('user')) {
            let idUser = JSON.parse(localStorage.getItem('user')).user._id
            infoOder = {
                name: value.fullname,
                email: value.email,
                address: value.address,
                phone: value.phone,
                status: 0,
                total: totalCart,
                User: idUser
            }
        } else {
            infoOder = {
                name: value.fullname,
                email: value.email,
                address: value.address,
                phone: value.phone,
                status: 0,
                total: totalCart,
            }
        }

        const addOrder = async () => {
            if (dataCart.length > 0) {
                const { data } = await add(infoOder);
                const idOrder = data._id
                await dataCart.forEach(async (item) => {
                    await addDetailBill({
                        infoOder: idOrder,
                        name: item.name,
                        price: item.price,
                        img: item.image,
                        size: item.size,
                        total: item.total,
                        desc: item.desc,
                        quantity: item.quantity
                    })
                })
                dispatch(resetCart())
                const toastrConfirmOptions = {
                    onOk: () => { navigate("/") },
                    onCancel: () => navigate("/")
                };
                toastr.confirm('B???n ???? ?????t h??ng th??nh c??ng, Vui l??ng ch??? ????n h??ng v???n chuy???n?', toastrConfirmOptions);
            } else {
                toastr.error("Th??ng B??o, B???n ch??a th??m s???n ph???m v??o gi??? h??ng ????? thanh to??n")
            }
        }
        addOrder()
    }

    const AddVoucherSubmit = async (e) => {
        // Click submit s??? l???y value t??? state textarena v??o ????y x??? l??
        e.preventDefault()
        let decQuantityVoucher = {}
        try {
            const { data } = await read(valueVoucher);
            console.log("dataVoucher", data);
            if (data.voucher.used < 1) {
                decQuantityVoucher = {
                    _id: data.voucher._id,
                    name: data.voucher.name,
                    priceSale: data.voucher.priceSale,
                    used: 0
                }
            }
            decQuantityVoucher = {
                _id: data.voucher._id,
                name: data.voucher.name,
                priceSale: data.voucher.priceSale,
                used: data.voucher.used - 1
            }
            dispatch(updateVoucher(decQuantityVoucher))
            setPriceVoucher(priceVoucher += data.voucher.priceSale)
            toastr.success("Th??ng B??o", "??p d???ng Voucher th??nh c??ng")
        } catch (error) {
            toastr.error("Th??ng B??o", error.response.data.error)
        }
    }

    const handleChangeValueVoucher = (event) => {
        setValueVoucher(event.target.value);
    }

    useEffect(() => {

    }, [priceVoucher])

    return (
        <>
            <main className="grid grid-cols-8 gap-3 my-2 relative">
                <div className="col-span-8">
                    <div className="grid grid-cols-9">
                        <div className="col-span-5 px-[65px]" id="checkout-left">
                            <h2 className="text-2xl font-bold my-4">Thanh To??n S???n Ph???m</h2>
                            <ul>
                                <li className="inline-block mr-2"><Link to="/cart" className="text-[#338dbc] text-sm">Gi??? h??ng</Link></li>
                                <li className="inline-block mx-2"><span className="text-sm">Th??ng tin giao h??ng</span></li>
                                <li className="inline-block mx-2"><span className="text-[#999999] text-sm">Thanh to??n</span></li>
                            </ul>
                            <span className="block my-2 text-xl">Th??ng tin giao h??ng</span>
                            { localStorage.getItem('user') ? "" : (
                                <div className="my-2">
                                    <span className="text-[#737373]">B???n ???? c?? t??i kho???n?</span>
                                    <Link to="/" className="text-[#338dbc]">????ng nh???p</Link>
                                </div>
                            ) }
                            <form action="" onSubmit={ handleSubmit(addOder) }>
                                <div className="">
                                    <div className="form-group">
                                        <label className="block py-2 font-bold text-lg">H??? v?? t??n</label>
                                        <input type="text" { ...register('fullname', { required: true }) } className="border border-black w-full px-2 py-2 rounded fullname" name="fullname"
                                            placeholder="H??? v?? t??n..." />
                                        { errors.fullname && <span className="text-red-500 block my-[5px] text-[18px] font-bold">Nh???p t??n ng?????i nh???n</span> }
                                    </div>
                                    <div className="grid grid-cols-8 gap-2">
                                        <div className="form-group col-span-5">
                                            <label className="block py-2 font-bold text-lg">Email</label>
                                            <input type="text"  { ...register('email', { required: true }) } className="border border-black w-[100%] px-2 py-2 rounded email" name="email"
                                                placeholder="Email..." />
                                            { errors.email && <span className="text-red-500 block my-[5px] text-[18px] font-bold">Nh???p email ng?????i nh???n</span> }
                                        </div>
                                        <div className="form-group col-span-3">
                                            <label className="block py-2 font-bold text-lg">S??? ??i???n Tho???i</label>
                                            <input type="number"  { ...register('phone', { required: true }) } className="border border-black w-[100%] px-2 py-2 rounded phone" name="phone"
                                                placeholder="S??? ??i???n Tho???i..." />
                                            { errors.phone && <span className="text-red-500 block my-[5px] text-[18px] font-bold">Nh???p s??? ??i???n tho???i ng?????i nh???n</span> }
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="block py-2 font-bold text-lg">?????a Ch???</label>
                                        <input type="text"  { ...register('address', { required: true }) } className="border border-black w-full px-2 py-2 rounded address" name="address"
                                            placeholder="?????a Ch???..." />
                                        { errors.address && <span className="text-red-500 block my-[5px] text-[18px] font-bold">Nh???p email ng?????i nh???n</span> }
                                    </div>
                                </div>
                                <div className="text-center my-3">
                                    <button type="submit" className="bg-[#338dbc] text-white py-4 px-5 rounded text-xl ">Ti???p
                                        T???c Thanh
                                        To??n</button>
                                </div>
                            </ form>
                        </div >
                        <div id="checkout-right" className="col-span-4 bg-[#fafafa] border border-gray-300 border-y-0 p-7">
                            <div className="max-h-[500px] overflow-auto">
                                { dataCart.length > 0 ? dataCart.map(item => (
                                    <div key={ item._id } className=" grid grid-cols-5 border border-b-2 border-x-0 border-t-0 py-4">
                                        <div className="col-span-1 relative ">
                                            <img src={ item.image } alt="" width="150" />
                                            <span className="absolute inline-block bg-[rgba(153,153,153,0.9)] text-white px-[10px] font-bold right-[-13px] top-[-11px]" >{ item.quantity }</span>
                                        </div>
                                        <div className="col-span-2 font-bold text-[18px] py-[45px] pl-[15px]"><span className="">{ item.name }</span></div>
                                        <div className="col-span-2  font-bold text-sm py-[45px]"><span className="text-red-500 font-bold text-[20px]">{ numberFormat.format(item.total) }</span><div className="">Size: { item.size }</div></div>
                                    </div>
                                )) : (
                                    <div className="border border-b-2 border-x-0 border-t-0 py-4 text-[23px]">
                                        <h2>Kh??ng c?? s???n ph???m n??o trong gi??? h??ng</h2>
                                    </div>
                                ) }
                            </div>
                            <div className="my-4 border border-b-2 border-x-0  border-t-0 py-5">
                                <div className="">
                                    <form action="" onSubmit={ AddVoucherSubmit }>
                                        <h2 className="font-bold text-[25px]">Nh???p m?? gi???m gi??</h2>
                                        <input type="text" value={ valueVoucher } onChange={ handleChangeValueVoucher } className="border border-black px-[10px] py-[5px]" placeholder="M?? gi???m gi??" />
                                        <button className="inline-block text-white bg-red-500 ml-[15px] px-[10px] py-[5px] rounded">Nh???p</button>
                                    </form>
                                </div>
                            </div>
                            <div className="my-4 border border-b-2 border-x-0  border-t-0 py-5">
                                <div className="grid grid-cols-2">
                                    <div className="">
                                        <span className="text-[#717171] text-lg">T???m t??nh</span>
                                    </div>
                                    <div className="text-right font-bold">
                                        <span className="tamtinh">{ dataCart && dataCart.forEach((data) => { totalCart += data.total }) } { numberFormat.format(totalCart) }</span>
                                    </div>
                                    <div className="">
                                        <span className="text-[#717171] text-lg">M?? Gi???m Gi??</span>
                                    </div>
                                    <div className="text-right font-bold">
                                        <span className="">{ numberFormat.format(priceVoucher) }</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2">
                                <div className="">
                                    <span className="text-[#717171] text-xl">T???ng C???ng</span>
                                </div>
                                <div className="text-right font-bold text-2xl">
                                    <span className="text-red-500"> { numberFormat.format(totalCart -= priceVoucher) }</span>
                                </div>
                            </div>
                        </div>
                    </div >
                </div >
            </main >
        </>
    )
}

export default CheckOut