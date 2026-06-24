import React, { useState, useEffect } from 'react';
import { X, Briefcase, Users, DollarSign, FileText, ChevronRight, Check, AlertCircle, ChevronDown, ImagePlus } from 'lucide-react';
import styles from './CreateJobModal.module.css';
import { createEmployerJob, uploadJobImage, type CreateEmployerJobRequestDTO } from '../../../services/employerJobApi';
import { getEmployerStores, type EmployerStoreDTO } from '../../../services/storeApi';
import { getCategories, getShifts } from '../../../services/job.service';

interface CreateJobModalProps {
  onClose: () => void;
}

const CustomSelect = ({ value, onChange, options, error, placeholder }: { value: any, onChange: (val: any) => void, options: {value: any, label: string}[], error?: boolean, placeholder?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <div className={styles.customSelectWrapper}>
      <div 
        className={`${styles.customSelectHeader} ${error ? styles.inputError : ''} ${isOpen ? styles.customSelectOpen : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={18} color="#94A3B8" />
      </div>
      {isOpen && (
        <>
          <div className={styles.customSelectOverlay} onClick={() => setIsOpen(false)} />
          <div className={styles.customSelectDropdown}>
            {options.map(opt => (
              <div 
                key={opt.value} 
                className={`${styles.customSelectOption} ${opt.value === value ? styles.customSelectOptionActive : ''}`}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const steps = [
  { id: 1, title: 'Thông tin chung', icon: Briefcase, desc: 'Tên công việc và vị trí' },
  { id: 2, title: 'Yêu cầu ứng viên', icon: Users, desc: 'Số lượng và đối tượng' },
  { id: 3, title: 'Lương & Ca làm', icon: DollarSign, desc: 'Mức chi trả và thời gian' },
  { id: 4, title: 'Chi tiết công việc', icon: FileText, desc: 'Mô tả và quyền lợi' }
];

export const CreateJobModal: React.FC<CreateJobModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [stores, setStores] = useState<EmployerStoreDTO[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [images, setImages] = useState<File[]>([]);
  
  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: 'success' | 'error', message: string} | null>(null);

  const [form, setForm] = useState<CreateEmployerJobRequestDTO>({
    title: '',
    storeId: 0,
    jobDescription: '',
    requirements: '',
    benefits: '',
    hourlyWageMin: 0,
    hourlyWageMax: 0,
    vacancyCount: 1,
    minAge: 18,
    maxAge: 30,
    genderRequirement: 'ANY',
    employmentType: 'PART_TIME',
    expiredAt: new Date().toISOString().split('T')[0],
    shiftIds: [],
    categoryIds: []
  });

  useEffect(() => {
    // Fetch data
    Promise.all([
      getEmployerStores(),
      getCategories(),
      getShifts()
    ]).then(([storeRes, catsRes, shiftsRes]) => {
      // Filter only active stores
      const activeStores = (storeRes.stores || []).filter(s => s.status === 'ACTIVE');
      setStores(activeStores);
      if (activeStores.length > 0) {
        setForm(f => ({ ...f, storeId: Number(activeStores[0].storeId) }));
      }
      
      setCategories(catsRes || []);
      setShifts(shiftsRes || []);
    }).catch(err => console.error("Lỗi khi tải dữ liệu khởi tạo:", err));
  }, []);

  // Realtime validation
  useEffect(() => {
    setErrors(prev => {
      const newErrors = { ...prev };
      let hasChanges = false;

      // Date validation
      if (form.expiredAt) {
        const selectedDate = new Date(form.expiredAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          if (newErrors.expiredAt !== 'Hạn nộp không được chọn ngày trong quá khứ') {
            newErrors.expiredAt = 'Hạn nộp không được chọn ngày trong quá khứ';
            hasChanges = true;
          }
        } else {
          if (newErrors.expiredAt === 'Hạn nộp không được chọn ngày trong quá khứ') {
            delete newErrors.expiredAt;
            hasChanges = true;
          }
        }
      }

      // Min Wage validation
      if (form.hourlyWageMin !== undefined) {
        if (form.hourlyWageMin < 10000) {
          if (newErrors.hourlyWageMin !== 'Lương tối thiểu không hợp lệ (> 10,000)') {
            newErrors.hourlyWageMin = 'Lương tối thiểu không hợp lệ (> 10,000)';
            hasChanges = true;
          }
        } else {
          if (newErrors.hourlyWageMin === 'Lương tối thiểu không hợp lệ (> 10,000)') {
            delete newErrors.hourlyWageMin;
            hasChanges = true;
          }
        }
      }

      // Max Wage validation
      if (form.hourlyWageMax !== undefined && form.hourlyWageMin !== undefined && form.hourlyWageMax > 0) {
        if (form.hourlyWageMax < form.hourlyWageMin) {
          if (newErrors.hourlyWageMax !== 'Lương tối đa phải >= lương tối thiểu') {
            newErrors.hourlyWageMax = 'Lương tối đa phải >= lương tối thiểu';
            hasChanges = true;
          }
        } else {
          if (newErrors.hourlyWageMax === 'Lương tối đa phải >= lương tối thiểu') {
            delete newErrors.hourlyWageMax;
            hasChanges = true;
          }
        }
      } else if (form.hourlyWageMax === undefined || form.hourlyWageMax === 0 || isNaN(form.hourlyWageMax)) {
        if (newErrors.hourlyWageMax === 'Lương tối đa phải >= lương tối thiểu') {
          delete newErrors.hourlyWageMax;
          hasChanges = true;
        }
      }

      return hasChanges ? newErrors : prev;
    });
  }, [form.expiredAt, form.hourlyWageMin, form.hourlyWageMax]);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!form.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề công việc';
      if (!form.storeId || form.storeId === 0) newErrors.storeId = 'Vui lòng chọn cửa hàng đang hoạt động';
      if (!form.categoryIds || form.categoryIds.length === 0) newErrors.categoryIds = 'Vui lòng chọn ít nhất 1 loại hình (danh mục)';
    }
    if (step === 2) {
      if (!form.vacancyCount || form.vacancyCount < 1) newErrors.vacancyCount = 'Số lượng tuyển phải lớn hơn 0';
    }
    if (step === 3) {
      if (!form.hourlyWageMin || form.hourlyWageMin < 10000) newErrors.hourlyWageMin = 'Lương tối thiểu không hợp lệ (> 10,000)';
      if (form.hourlyWageMax && form.hourlyWageMax > 0 && form.hourlyWageMax < (form.hourlyWageMin || 0)) {
        newErrors.hourlyWageMax = 'Lương tối đa phải >= lương tối thiểu';
      }
      if (!form.shiftIds || form.shiftIds.length === 0) newErrors.shiftIds = 'Vui lòng chọn ít nhất 1 ca làm việc';
      if (!form.expiredAt) {
        newErrors.expiredAt = 'Vui lòng chọn hạn chót ứng tuyển';
      } else {
        const selectedDate = new Date(form.expiredAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          newErrors.expiredAt = 'Hạn nộp không được chọn ngày trong quá khứ';
        }
      }
    }
    if (step === 4) {
      if (!form.jobDescription.trim()) newErrors.jobDescription = 'Vui lòng nhập mô tả công việc';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => { 
    if (validateStep(currentStep)) {
      if (currentStep < 4) setCurrentStep(c => c + 1); 
    }
  };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(c => c - 1); };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setLoading(true);
    try {
      const jobRes = await createEmployerJob(form);
      const jobId = jobRes.id;
      
      if (images.length > 0) {
        for (const img of images) {
          await uploadJobImage(jobId, img);
        }
      }
      
      setAlertInfo({ show: true, type: 'success', message: 'Tạo tin tuyển dụng thành công! Tin của bạn đang ở trạng thái Chờ Duyệt.' });
    } catch (err: any) {
      setAlertInfo({ show: true, type: 'error', message: err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo tin tuyển dụng' });
    } finally {
      setLoading(false);
    }
  };

  const closeAlert = () => {
    if (alertInfo?.type === 'success') {
      onClose();
    } else {
      setAlertInfo(null);
    }
  };

  const renderError = (field: string) => {
    if (!errors[field]) return null;
    return (
      <div className={styles.errorText}>
        <AlertCircle size={14} /> {errors[field]}
      </div>
    );
  };

  const toggleCategory = (catId: number) => {
    const current = [...(form.categoryIds || [])];
    if (current.includes(catId)) {
      setForm({ ...form, categoryIds: current.filter(id => id !== catId) });
    } else {
      setForm({ ...form, categoryIds: [...current, catId] });
    }
  };

  const toggleShift = (shiftId: number) => {
    const current = [...(form.shiftIds || [])];
    if (current.includes(shiftId)) {
      setForm({ ...form, shiftIds: current.filter(id => id !== shiftId) });
    } else {
      setForm({ ...form, shiftIds: [...current, shiftId] });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          
          {/* LEFT SIDEBAR - STEPPER */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarTitle}>Tạo Tin Tuyển Dụng</div>
            <div className={styles.stepperContainer}>
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className={`${styles.stepItem} ${isActive ? styles.stepActive : ''} ${isCompleted ? styles.stepCompleted : ''}`}>
                    <div className={styles.stepIconWrapper}>
                      {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                    </div>
                    <div className={styles.stepText}>
                      <div className={styles.stepTitleTxt}>{step.title}</div>
                      <div className={styles.stepDescTxt}>{step.desc}</div>
                    </div>
                    {index < steps.length - 1 && <div className={styles.stepLine}></div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT MAIN PANEL */}
          <div className={styles.mainPanel}>
            <div className={styles.panelHeader}>
              <button className={styles.closeBtn} onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.panelBody}>
              {/* STEP 1 */}
              {currentStep === 1 && (
                <div className={styles.stepContent}>
                  <h2 className={styles.stepHeader}>Thông tin chung</h2>
                  <p className={styles.stepSubHeader}>Bắt đầu bằng việc xác định vị trí và nơi làm việc.</p>
                  
                  <div className={styles.formGroup}>
                    <label>Tiêu đề công việc <span className={styles.required}>*</span></label>
                    <input 
                      type="text" 
                      placeholder="VD: Nhân viên phục vụ quán cà phê" 
                      value={form.title}
                      onChange={e => setForm({...form, title: e.target.value})}
                      className={errors.title ? styles.inputError : ''}
                      autoFocus 
                    />
                    {renderError('title')}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Cửa hàng <span className={styles.required}>*</span></label>
                    <CustomSelect 
                      value={form.storeId} 
                      onChange={val => setForm({...form, storeId: val})}
                      options={stores.map(s => ({ value: s.storeId, label: s.name }))}
                      error={!!errors.storeId}
                      placeholder="Chọn cơ sở làm việc..."
                    />
                    {stores.length === 0 && <span style={{fontSize: '0.8rem', color: '#64748B'}}>Không có cửa hàng nào đang hoạt động.</span>}
                    {renderError('storeId')}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Loại hình công việc (Danh mục) <span className={styles.required}>*</span></label>
                    <div className={styles.chipContainer}>
                      {categories.map(cat => {
                        const isSelected = form.categoryIds?.includes(cat.id);
                        return (
                          <div 
                            key={cat.id} 
                            className={`${styles.chip} ${isSelected ? styles.chipSelected : ''}`}
                            onClick={() => toggleCategory(cat.id)}
                          >
                            {cat.name}
                          </div>
                        );
                      })}
                    </div>
                    {renderError('categoryIds')}
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <div className={styles.stepContent}>
                  <h2 className={styles.stepHeader}>Yêu cầu ứng viên</h2>
                  <p className={styles.stepSubHeader}>Xác định rõ đối tượng mà bạn đang tìm kiếm.</p>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Số lượng tuyển dụng <span className={styles.required}>*</span></label>
                      <input 
                        type="number" 
                        min="1" 
                        placeholder="VD: 5" 
                        value={form.vacancyCount}
                        onChange={e => setForm({...form, vacancyCount: parseInt(e.target.value)})}
                        className={errors.vacancyCount ? styles.inputError : ''}
                      />
                      {renderError('vacancyCount')}
                    </div>
                    <div className={styles.formGroup}>
                      <label>Giới tính <span className={styles.required}>*</span></label>
                      <CustomSelect 
                        value={form.genderRequirement} 
                        onChange={val => setForm({...form, genderRequirement: val})}
                        options={[
                          { value: 'ANY', label: 'Không yêu cầu' },
                          { value: 'MALE', label: 'Chỉ tuyển Nam' },
                          { value: 'FEMALE', label: 'Chỉ tuyển Nữ' }
                        ]}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Độ tuổi cho phép</label>
                    <div className={styles.ageInputs}>
                      <div className={styles.ageInputWrapper}>
                        <span className={styles.ageLabel}>Từ</span>
                        <input 
                          type="number" 
                          min="16" 
                          value={form.minAge}
                          onChange={e => setForm({...form, minAge: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className={styles.ageSeparator}>-</div>
                      <div className={styles.ageInputWrapper}>
                        <span className={styles.ageLabel}>Đến</span>
                        <input 
                          type="number" 
                          max="60" 
                          value={form.maxAge}
                          onChange={e => setForm({...form, maxAge: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <div className={styles.stepContent}>
                  <h2 className={styles.stepHeader}>Lương & Ca làm</h2>
                  <p className={styles.stepSubHeader}>Cung cấp mức đãi ngộ và thời gian làm việc để thu hút ứng viên.</p>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Lương tối thiểu (đ/giờ) <span className={styles.required}>*</span></label>
                      <div className={`${styles.inputWithSuffix} ${errors.hourlyWageMin ? styles.inputError : ''}`}>
                        <input 
                          type="number" 
                          value={form.hourlyWageMin || ''}
                          onChange={e => setForm({...form, hourlyWageMin: parseInt(e.target.value)})}
                        />
                        <span className={styles.suffix}>VND</span>
                      </div>
                      {renderError('hourlyWageMin')}
                    </div>
                    <div className={styles.formGroup}>
                      <label>Lương tối đa (đ/giờ)</label>
                      <div className={`${styles.inputWithSuffix} ${errors.hourlyWageMax ? styles.inputError : ''}`}>
                        <input 
                          type="number" 
                          value={form.hourlyWageMax || ''}
                          onChange={e => setForm({...form, hourlyWageMax: parseInt(e.target.value)})}
                        />
                        <span className={styles.suffix}>VND</span>
                      </div>
                      {renderError('hourlyWageMax')}
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Ca làm việc <span className={styles.required}>*</span></label>
                    <div className={styles.chipContainer}>
                      {shifts.map(shift => {
                        const isSelected = form.shiftIds?.includes(shift.id);
                        return (
                          <div 
                            key={shift.id} 
                            className={`${styles.chip} ${isSelected ? styles.chipSelected : ''}`}
                            onClick={() => toggleShift(shift.id)}
                          >
                            {shift.name}
                          </div>
                        );
                      })}
                    </div>
                    {renderError('shiftIds')}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Hạn chót ứng tuyển <span className={styles.required}>*</span></label>
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={form.expiredAt}
                      onChange={e => setForm({...form, expiredAt: e.target.value})}
                      className={errors.expiredAt ? styles.inputError : ''}
                    />
                    {renderError('expiredAt')}
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {currentStep === 4 && (
                <div className={styles.stepContent}>
                  <h2 className={styles.stepHeader}>Chi tiết công việc</h2>
                  <p className={styles.stepSubHeader}>Mô tả rõ ràng giúp ứng viên đưa ra quyết định nhanh hơn.</p>
                  
                  <div className={styles.formGroup}>
                    <label>Mô tả công việc <span className={styles.required}>*</span></label>
                    <textarea 
                      rows={3} 
                      placeholder="Mô tả công việc hàng ngày, trách nhiệm chính..."
                      value={form.jobDescription}
                      onChange={e => setForm({...form, jobDescription: e.target.value})}
                      className={errors.jobDescription ? styles.inputError : ''}
                    ></textarea>
                    {renderError('jobDescription')}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Yêu cầu kỹ năng / Kinh nghiệm</label>
                    <textarea 
                      rows={2} 
                      placeholder="Nhanh nhẹn, có xe máy, ưu tiên sinh viên..."
                      value={form.requirements}
                      onChange={e => setForm({...form, requirements: e.target.value})}
                    ></textarea>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Quyền lợi được hưởng</label>
                    <textarea 
                      rows={2} 
                      placeholder="Phụ cấp ăn ca, thưởng doanh số, xoay ca linh hoạt..."
                      value={form.benefits}
                      onChange={e => setForm({...form, benefits: e.target.value})}
                    ></textarea>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Hình ảnh cửa hàng / Môi trường làm việc</label>
                    <label className={styles.imageUploadZone}>
                      <ImagePlus size={32} className={styles.imageUploadIcon} />
                      <div>
                        <div className={styles.imageUploadText}>Nhấn để chọn hoặc kéo thả ảnh vào đây</div>
                        <div className={styles.imageUploadSubText}>Hỗ trợ JPG, PNG. Có thể tải lên nhiều ảnh cùng lúc.</div>
                      </div>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={handleImageChange} 
                      />
                    </label>
                    
                    {images.length > 0 && (
                      <div className={styles.imagePreviewContainer}>
                        {images.map((img, idx) => (
                          <div key={idx} className={styles.imagePreviewWrapper}>
                            <img src={URL.createObjectURL(img)} alt="preview" />
                            <button 
                              className={styles.removeImageBtn} 
                              onClick={() => removeImage(idx)}
                              type="button"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            <div className={styles.panelFooter}>
              <button className={styles.btnGhost} onClick={currentStep === 1 ? onClose : prevStep}>
                {currentStep === 1 ? 'Hủy bỏ' : 'Quay lại'}
              </button>
              
              {currentStep < 4 ? (
                <button className={styles.btnPrimary} onClick={nextStep}>
                  Tiếp tục <ChevronRight size={18} />
                </button>
              ) : (
                <button className={styles.btnSuccess} onClick={handleSubmit} disabled={loading}>
                  {loading ? (images.length > 0 ? 'Đang tải ảnh...' : 'Đang xử lý...') : 'Đăng tin ngay'} <Check size={18} style={{ marginLeft: 6 }} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOM ALERT UI */}
      {alertInfo && alertInfo.show && (
        <div className={styles.alertOverlay}>
          <div className={styles.alertContent}>
            <div className={`${styles.alertIcon} ${alertInfo.type === 'success' ? styles.alertIconSuccess : styles.alertIconError}`}>
              {alertInfo.type === 'success' ? <Check size={32} /> : <AlertCircle size={32} />}
            </div>
            <div className={styles.alertTitle}>
              {alertInfo.type === 'success' ? 'Thành công' : 'Thất bại'}
            </div>
            <div className={styles.alertMessage}>
              {alertInfo.message}
            </div>
            <button 
              className={`${styles.alertBtn} ${alertInfo.type === 'success' ? styles.alertBtnSuccess : styles.alertBtnError}`}
              onClick={closeAlert}
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
};

