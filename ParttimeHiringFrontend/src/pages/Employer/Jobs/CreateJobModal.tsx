import React, { useState } from 'react';
import { X, Briefcase, Users, DollarSign, FileText, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import styles from './CreateJobModal.module.css';

interface CreateJobModalProps {
  onClose: () => void;
}

const steps = [
  { id: 1, title: 'Thông tin chung', icon: Briefcase, desc: 'Tên công việc và vị trí' },
  { id: 2, title: 'Yêu cầu ứng viên', icon: Users, desc: 'Số lượng và đối tượng' },
  { id: 3, title: 'Lương & Ca làm', icon: DollarSign, desc: 'Mức chi trả và thời gian' },
  { id: 4, title: 'Chi tiết công việc', icon: FileText, desc: 'Mô tả và quyền lợi' }
];

const categoriesList = ['Phục vụ', 'Pha chế', 'Bán hàng', 'Thu ngân', 'Lễ tân', 'Bếp', 'Kho'];
const shiftsList = ['Ca sáng (08:00 - 12:00)', 'Ca chiều (13:00 - 17:00)', 'Ca tối (18:00 - 22:00)', 'Ca gãy (Theo lịch)'];

export const CreateJobModal: React.FC<CreateJobModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Fake state for pills to look interactive
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);

  const toggleCat = (c: string) => {
    setSelectedCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const toggleShift = (s: string) => {
    setSelectedShifts(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const nextStep = () => { if (currentStep < 4) setCurrentStep(c => c + 1); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(c => c - 1); };

  return (
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
                  <input type="text" placeholder="VD: Nhân viên phục vụ quán cà phê" autoFocus />
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Cửa hàng <span className={styles.required}>*</span></label>
                    <select>
                      <option value="">Chọn cơ sở làm việc...</option>
                      <option>Cơ sở 1 - Lotte Mart</option>
                      <option>Cơ sở 2 - Vincom</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Loại hình <span className={styles.required}>*</span></label>
                    <select>
                      <option value="PART-TIME">Part-time</option>
                      <option value="FULL-TIME">Full-time</option>
                      <option value="SEASONAL">Thời vụ</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Danh mục công việc (Chọn nhiều)</label>
                  <div className={styles.pillGroup}>
                    {categoriesList.map(c => (
                      <div 
                        key={c} 
                        className={`${styles.pill} ${selectedCats.includes(c) ? styles.pillActive : ''}`}
                        onClick={() => toggleCat(c)}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
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
                    <input type="number" min="1" placeholder="VD: 5" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Giới tính <span className={styles.required}>*</span></label>
                    <select>
                      <option value="ANY">Không yêu cầu (Khuyến khích)</option>
                      <option value="MALE">Chỉ tuyển Nam</option>
                      <option value="FEMALE">Chỉ tuyển Nữ</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Độ tuổi cho phép</label>
                  <div className={styles.ageInputs}>
                    <div className={styles.ageInputWrapper}>
                      <span className={styles.ageLabel}>Từ</span>
                      <input type="number" min="16" placeholder="18" />
                    </div>
                    <div className={styles.ageSeparator}>-</div>
                    <div className={styles.ageInputWrapper}>
                      <span className={styles.ageLabel}>Đến</span>
                      <input type="number" max="60" placeholder="25" />
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
                    <div className={styles.inputWithSuffix}>
                      <input type="number" placeholder="20000" />
                      <span className={styles.suffix}>VND</span>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Lương tối đa (đ/giờ)</label>
                    <div className={styles.inputWithSuffix}>
                      <input type="number" placeholder="25000" />
                      <span className={styles.suffix}>VND</span>
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Ca làm việc trống (Chọn nhiều)</label>
                  <div className={styles.pillGroupVertical}>
                    {shiftsList.map(s => (
                      <div 
                        key={s} 
                        className={`${styles.pillVertical} ${selectedShifts.includes(s) ? styles.pillActive : ''}`}
                        onClick={() => toggleShift(s)}
                      >
                        <div className={styles.pillRadio}>
                          {selectedShifts.includes(s) && <div className={styles.pillRadioInner} />}
                        </div>
                        {s}
                      </div>
                    ))}
                  </div>
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
                  <textarea rows={3} placeholder="Mô tả công việc hàng ngày, trách nhiệm chính..."></textarea>
                </div>

                <div className={styles.formGroup}>
                  <label>Yêu cầu kỹ năng / Kinh nghiệm</label>
                  <textarea rows={2} placeholder="Nhanh nhẹn, có xe máy, ưu tiên sinh viên..."></textarea>
                </div>

                <div className={styles.formGroup}>
                  <label>Quyền lợi được hưởng</label>
                  <textarea rows={2} placeholder="Phụ cấp ăn ca, thưởng doanh số, xoay ca linh hoạt..."></textarea>
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
              <button className={styles.btnSuccess} onClick={onClose}>
                Đăng tin ngay <Check size={18} style={{ marginLeft: 6 }} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
