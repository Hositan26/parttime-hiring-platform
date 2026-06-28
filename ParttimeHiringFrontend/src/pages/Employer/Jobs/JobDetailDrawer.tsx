import React, { useState, useEffect } from 'react';
import { X, FileText, Users, DollarSign, Calendar, MapPin, Clock, Briefcase, User, Star, Edit, Save, Trash, MessageSquare, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import styles from './JobDetailDrawer.module.css';
import { getEmployerJobDetail, getJobApplicants, getJobComments, uploadJobImage, deleteJobImage, updateEmployerJob, type EmployerJobDetailDTO, type EmployerJobApplicantDTO, type EmployerJobCommentDTO } from '../../../services/employerJobApi';
import { updateApplicationStatus } from '../../../services/application.service';
import { ProfileModal } from '../../../components/ProfileModal/ProfileModal';
import { getCategories, getShifts } from '../../../services/job.service';

interface JobDetailDrawerProps {
  jobId: number;
  onClose: () => void;
}

export const JobDetailDrawer: React.FC<JobDetailDrawerProps> = ({ jobId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'APPLICANTS' | 'COMMENTS'>('DETAILS');
  const [job, setJob] = useState<EmployerJobDetailDTO | null>(null);
  const [applicants, setApplicants] = useState<EmployerJobApplicantDTO[]>([]);
  const [comments, setComments] = useState<EmployerJobCommentDTO[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<EmployerJobApplicantDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  const [categories, setCategories] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([getCategories(), getShifts()]).then(([catsRes, shiftsRes]) => {
      setCategories((catsRes as any).result || catsRes || []);
      setShifts((shiftsRes as any).result || shiftsRes || []);
    });
  }, []);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await getEmployerJobDetail(jobId);
      setJob(data);
      setEditForm({
        title: data.title,
        jobDescription: data.description,
        requirements: data.requirements,
        benefits: data.benefits,
        hourlyWageMin: data.salary.split(' - ')[0] ? parseInt(data.salary.split(' - ')[0].replace(/[^0-9]/g, '')) : 0,
        hourlyWageMax: data.salary.split(' - ')[1] ? parseInt(data.salary.split(' - ')[1].replace(/[^0-9]/g, '')) : 0,
        vacancyCount: data.vacancyCount,
        employmentType: data.type === 'PART_TIME' || data.type === 'FULL_TIME' ? data.type : 'PART_TIME',
        expiredAt: data.rawExpiredAt || '2099-12-31',
        genderRequirement: data.genderRequirement || 'ANY',
        minAge: data.minAge || 18,
        maxAge: data.maxAge || 60,
        status: data.status || 'ACTIVE',
        categoryIds: data.categoryIds || [],
        shiftIds: data.shiftIds || []
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async () => {
    try {
      const data = await getJobApplicants(jobId);
      setApplicants(data);
    } catch (e) {}
  };

  const fetchComments = async () => {
    try {
      const data = await getJobComments(jobId);
      setComments(data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchDetail();
    fetchApplicants();
    fetchComments();
  }, [jobId]);

  const handleSave = async () => {
    // Validate date
    if (editForm.expiredAt) {
      const selectedDate = new Date(editForm.expiredAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        alert('Hạn nộp không được chọn ngày trong quá khứ!');
        return;
      }
    }

    try {
      await updateEmployerJob(jobId, {
        ...editForm
      });
      setIsEditing(false);
      fetchDetail();
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Cập nhật thất bại!');
    }
  };

  const toggleCategory = (catId: number) => {
    const current = [...(editForm.categoryIds || [])];
    if (current.includes(catId)) {
      setEditForm({ ...editForm, categoryIds: current.filter(id => id !== catId) });
    } else {
      setEditForm({ ...editForm, categoryIds: [...current, catId] });
    }
  };

  const toggleShift = (shiftId: number) => {
    const current = [...(editForm.shiftIds || [])];
    if (current.includes(shiftId)) {
      setEditForm({ ...editForm, shiftIds: current.filter(id => id !== shiftId) });
    } else {
      setEditForm({ ...editForm, shiftIds: [...current, shiftId] });
    }
  };

  const handleAddImage = async () => {
    if (newImageFiles.length === 0) return;
    try {
      for (const file of newImageFiles) {
        await uploadJobImage(jobId, file);
      }
      setNewImageFiles([]);
      fetchDetail();
    } catch (e) {
      alert('Thêm ảnh thất bại!');
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này?')) return;
    try {
      await deleteJobImage(jobId, imageId);
      fetchDetail();
    } catch (e) {
      alert('Xóa ảnh thất bại!');
    }
  };

  const handleUpdateApplicantStatus = async (applicationId: number, status: string) => {
    if (status === 'ACCEPTED') {
      const isConfirmed = window.confirm('Bạn có chắc chắn muốn duyệt ứng viên này? Hệ thống sẽ tạo hồ sơ nhân sự chính thức.');
      if (!isConfirmed) return;
    }
    try {
      await updateApplicationStatus(applicationId, status);
      // Refresh applicant list
      if (jobId) {
        const apps = await getJobApplicants(jobId);
        setApplicants(apps);
      }
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái.');
    }
  };

  if (loading || !job) {
    return (
      <div className={styles.drawerOverlay}>
        <div className={styles.drawerContent} style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
          Đang tải thông tin...
        </div>
      </div>
    );
  }

  const formatGender = (gender?: string) => {
    switch (gender) {
      case 'MALE': return 'Nam';
      case 'FEMALE': return 'Nữ';
      case 'ANY': return 'Không yêu cầu';
      default: return 'Không yêu cầu';
    }
  };

  return (
    <div className={styles.drawerOverlay}>
      <div className={styles.drawerContent}>
        
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.headerDecor}></div>
          <div className={styles.headerContent}>
            <div className={styles.headerInfo}>
              <div className={styles.logoContainer}>
                <img src={job.logo || 'https://cdn-icons-png.flaticon.com/512/3268/3268832.png'} alt="logo" className={styles.logo} />
              </div>
              <div className={styles.titleArea}>
                <div className={styles.metaTagsTop}>
                  <span className={`${styles.statusBadge} ${job.status === 'ACTIVE' ? styles.statusOPEN : job.status === 'EXPIRED' ? styles.statusEXPIRED : styles.statusCLOSED}`}>
                    {job.status === 'ACTIVE' ? 'ĐANG HOẠT ĐỘNG' : job.status === 'EXPIRED' ? 'ĐÃ HẾT HẠN' : 'ĐÃ ĐÓNG'}
                  </span>
                  <span className={styles.idText}>ID: {job.id}</span>
                </div>
                {isEditing ? (
                  <input 
                    className={styles.editInput} 
                    value={editForm.title} 
                    onChange={e => setEditForm({...editForm, title: e.target.value})} 
                  />
                ) : (
                  <h2>{job.title}</h2>
                )}
                <div className={styles.storeInfoRow}>
                  <MapPin size={16} />
                  <span>{job.store} - {job.address}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {isEditing ? (
                <button className={styles.saveBtn} onClick={handleSave}><Save size={16} /> Lưu</button>
              ) : (
                <button className={styles.editBtn} onClick={() => setIsEditing(true)}><Edit size={16} /> Sửa</button>
              )}
              <button className={styles.closeBtn} onClick={onClose}>
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'DETAILS' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('DETAILS')}
            >
              <FileText size={18} /> Thông tin chung
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'APPLICANTS' ? styles.tabActive : ''} ${isEditing ? styles.tabDisabled : ''}`}
              onClick={() => !isEditing && setActiveTab('APPLICANTS')}
              disabled={isEditing}
              title={isEditing ? 'Vui lòng lưu thay đổi trước khi chuyển tab' : ''}
            >
              <Users size={18} /> Ứng viên <span className={styles.badgeCount}>{job.applicants}</span>
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'COMMENTS' ? styles.tabActive : ''} ${isEditing ? styles.tabDisabled : ''}`}
              onClick={() => !isEditing && setActiveTab('COMMENTS')}
              disabled={isEditing}
              title={isEditing ? 'Vui lòng lưu thay đổi trước khi chuyển tab' : ''}
            >
              <MessageSquare size={18} /> Đánh giá <span className={styles.badgeCount}>{comments.length}</span>
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className={styles.body}>
          {activeTab === 'DETAILS' && (
            <div className={styles.detailsTab}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>
                  <div className={styles.iconWrapper} style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
                    <Briefcase size={20} />
                  </div>
                  <span>Tổng quan công việc</span>
                </div>
                <div className={styles.overviewGrid}>
                  {/* Status update logic when editing */}
                  {isEditing && (
                    <div className={styles.overviewItem} style={{ gridColumn: '1 / -1', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                        <AlertCircle size={18} color="#3B82F6" />
                        <span className={styles.overviewLabel}>Trạng thái hoạt động</span>
                      </div>
                      {job.status === 'EXPIRED' ? (
                        <div style={{ color: '#EF4444', fontSize: '0.9rem' }}>
                          Tin đã hết hạn. Vui lòng gia hạn <b>Hạn nộp</b> ở bên dưới trước khi chuyển sang trạng thái HOẠT ĐỘNG.
                        </div>
                      ) : (
                        <div className={styles.chipContainer}>
                          <button
                            type="button"
                            className={`${styles.chipBtn} ${editForm.status === 'ACTIVE' ? styles.chipSelected : ''}`}
                            onClick={() => setEditForm({...editForm, status: 'ACTIVE'})}
                          >
                            Đang hoạt động (ACTIVE)
                          </button>
                          <button
                            type="button"
                            className={`${styles.chipBtn} ${editForm.status === 'INACTIVE' ? styles.chipSelected : ''}`}
                            onClick={() => setEditForm({...editForm, status: 'INACTIVE'})}
                          >
                            Tạm đóng (INACTIVE)
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CATEGORIES CHIPS */}
                  <div className={styles.overviewItem} style={{ gridColumn: '1 / -1', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                      <Briefcase size={18} color="#8B5CF6" />
                      <span className={styles.overviewLabel}>Danh mục công việc</span>
                    </div>
                    <div className={styles.chipContainer}>
                      {isEditing ? (
                        categories.map(cat => {
                          const isSelected = editForm.categoryIds?.includes(cat.id);
                          return (
                            <button
                              key={cat.id}
                              className={`${styles.chipBtn} ${isSelected ? styles.chipSelected : ''}`}
                              onClick={() => toggleCategory(cat.id)}
                              type="button"
                            >
                              {cat.name}
                            </button>
                          );
                        })
                      ) : (
                        job.categoriesList && job.categoriesList.length > 0 ? (
                          job.categoriesList.map((catName, idx) => (
                            <span key={`cat-${idx}`} className={styles.chipViewCategory}>{catName}</span>
                          ))
                        ) : (
                          <span className={styles.overviewValue}>Chưa có danh mục</span>
                        )
                      )}
                    </div>
                  </div>

                  {/* SHIFTS CHIPS */}
                  <div className={styles.overviewItem} style={{ gridColumn: '1 / -1', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                      <Clock size={18} color="#F59E0B" />
                      <span className={styles.overviewLabel}>Ca làm việc</span>
                    </div>
                    <div className={styles.chipContainer}>
                      {isEditing ? (
                        shifts.map(shift => {
                          const isSelected = editForm.shiftIds?.includes(shift.id);
                          return (
                            <button
                              key={shift.id}
                              className={`${styles.chipBtn} ${isSelected ? styles.chipSelected : ''}`}
                              onClick={() => toggleShift(shift.id)}
                              type="button"
                            >
                              {shift.name} {shift.startTime && shift.endTime ? `(${shift.startTime.substring(0,5)} - ${shift.endTime.substring(0,5)})` : ''}
                            </button>
                          );
                        })
                      ) : (
                        job.shiftsList && job.shiftsList.length > 0 ? (
                          job.shiftsList.map((shiftName, idx) => (
                            <span key={`shift-${idx}`} className={styles.chipViewShift}>{shiftName}</span>
                          ))
                        ) : (
                          <span className={styles.overviewValue}>Ca linh hoạt</span>
                        )
                      )}
                    </div>
                  </div>
                  <div className={styles.overviewItem}>
                    <div className={styles.overviewIcon}><Users size={18} /></div>
                    <div className={styles.overviewText}>
                      <span className={styles.overviewLabel}>Cần tuyển</span>
                      {isEditing ? (
                        <input 
                          type="number" 
                          className={styles.editInputSmall} 
                          value={editForm.vacancyCount} 
                          onChange={e => setEditForm({...editForm, vacancyCount: parseInt(e.target.value) || 0})}
                        />
                      ) : (
                        <span className={styles.overviewValue}>{job.vacancyCount} người</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.overviewItem}>
                    <div className={styles.overviewIcon}><Calendar size={18} /></div>
                    <div className={styles.overviewText}>
                      <span className={styles.overviewLabel}>Hạn nộp</span>
                      {isEditing ? (
                        <input 
                          type="date" 
                          min={new Date().toISOString().split('T')[0]}
                          className={styles.editInputSmall} 
                          value={editForm.expiredAt} 
                          onChange={e => setEditForm({...editForm, expiredAt: e.target.value})}
                        />
                      ) : (
                        <span className={styles.overviewValue}>{job.deadline || 'Không thời hạn'}</span>
                      )}
                    </div>
                  </div>

                  {/* Always show Gender and Age */}
                  <div className={styles.overviewItem} style={isEditing ? { gridColumn: '1 / -1', flexDirection: 'column', alignItems: 'flex-start' } : {}}>
                    {isEditing ? (
                      <>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                          <User size={18} color="#00B14F" />
                          <span className={styles.overviewLabel}>Giới tính</span>
                        </div>
                        <div className={styles.chipContainer}>
                          <button type="button" className={`${styles.chipBtn} ${editForm.genderRequirement === 'ANY' ? styles.chipSelected : ''}`} onClick={() => setEditForm({...editForm, genderRequirement: 'ANY'})}>Không yêu cầu</button>
                          <button type="button" className={`${styles.chipBtn} ${editForm.genderRequirement === 'MALE' ? styles.chipSelected : ''}`} onClick={() => setEditForm({...editForm, genderRequirement: 'MALE'})}>Chỉ tuyển Nam</button>
                          <button type="button" className={`${styles.chipBtn} ${editForm.genderRequirement === 'FEMALE' ? styles.chipSelected : ''}`} onClick={() => setEditForm({...editForm, genderRequirement: 'FEMALE'})}>Chỉ tuyển Nữ</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={styles.overviewIcon}><User size={18} /></div>
                        <div className={styles.overviewText}>
                          <span className={styles.overviewLabel}>Giới tính</span>
                          <span className={styles.overviewValue}>{formatGender(job.genderRequirement)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className={styles.overviewItem}>
                    <div className={styles.overviewIcon}><Users size={18} /></div>
                    <div className={styles.overviewText}>
                      <span className={styles.overviewLabel}>Độ tuổi</span>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', width: '100%' }}>
                          <input 
                            type="number" 
                            className={styles.editInputSmall} 
                            value={editForm.minAge} 
                            onChange={e => setEditForm({...editForm, minAge: parseInt(e.target.value) || 18})}
                          />
                          <span style={{ color: '#94A3B8' }}>-</span>
                          <input 
                            type="number" 
                            className={styles.editInputSmall} 
                            value={editForm.maxAge} 
                            onChange={e => setEditForm({...editForm, maxAge: parseInt(e.target.value) || 60})}
                          />
                        </div>
                      ) : (
                        <span className={styles.overviewValue}>{job.minAge} - {job.maxAge} tuổi</span>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>
                  <div className={styles.iconWrapper} style={{ backgroundColor: '#FFFBEB', color: '#F59E0B' }}>
                    <DollarSign size={20} />
                  </div>
                  <span>Mức lương</span>
                </div>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%', padding: '0 24px 24px 24px' }}>
                    <input 
                      type="number" 
                      placeholder="Tối thiểu"
                      className={styles.editInputSmall} 
                      value={editForm.hourlyWageMin} 
                      onChange={e => setEditForm({...editForm, hourlyWageMin: parseInt(e.target.value) || 0})}
                    />
                    <span style={{ color: '#94A3B8', fontWeight: 'bold' }}>-</span>
                    <input 
                      type="number" 
                      placeholder="Tối đa"
                      className={styles.editInputSmall} 
                      value={editForm.hourlyWageMax} 
                      onChange={e => setEditForm({...editForm, hourlyWageMax: parseInt(e.target.value) || 0})}
                    />
                    <span style={{ fontWeight: '800', color: '#0F172A', whiteSpace: 'nowrap' }}>VND / giờ</span>
                  </div>
                ) : (
                  <div className={styles.salaryBox}>
                    <span className={styles.salaryLabel}>Mức lương đề xuất</span>
                    <div>
                      <span className={styles.salaryAmount}>{job.salary} VND/giờ</span>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>
                  <div className={styles.iconWrapper} style={{ backgroundColor: '#FAF5FF', color: '#9333EA' }}>
                    <FileText size={20} />
                  </div>
                  <span>Chi tiết yêu cầu</span>
                </div>
                
                <div className={styles.contentSection}>
                  <h4>Mô tả công việc</h4>
                  {isEditing ? (
                    <textarea 
                      className={styles.editTextarea} 
                      value={editForm.jobDescription} 
                      onChange={e => setEditForm({...editForm, jobDescription: e.target.value})} 
                      rows={4}
                    />
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{job.description || 'Chưa có mô tả'}</div>
                  )}
                </div>

                <div className={styles.contentSection}>
                  <h4>Yêu cầu ứng viên</h4>
                  {isEditing ? (
                    <textarea 
                      className={styles.editTextarea} 
                      value={editForm.requirements} 
                      onChange={e => setEditForm({...editForm, requirements: e.target.value})} 
                      rows={4}
                    />
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{job.requirements || 'Không yêu cầu gì thêm'}</div>
                  )}
                </div>

                <div className={styles.contentSection}>
                  <h4>Quyền lợi</h4>
                  {isEditing ? (
                    <textarea 
                      className={styles.editTextarea} 
                      value={editForm.benefits} 
                      onChange={e => setEditForm({...editForm, benefits: e.target.value})} 
                      rows={4}
                    />
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{job.benefits || 'Trao đổi khi phỏng vấn'}</div>
                  )}
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>
                  <div className={styles.iconWrapper} style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}>
                    <ImageIcon size={20} />
                  </div>
                  <span>Hình ảnh môi trường làm việc</span>
                </div>
                
                <div className={styles.imagesTab} style={{ padding: '0 24px 24px 24px' }}>
                  {isEditing && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px', marginBottom: '24px' }}>
                      <div className={styles.uploadZone}>
                        <input 
                          type="file" 
                          accept="image/*"
                          multiple
                          id="imageUploadInput"
                          onChange={e => {
                            if (e.target.files && e.target.files.length > 0) {
                              setNewImageFiles(Array.from(e.target.files));
                            }
                          }}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="imageUploadInput" className={styles.uploadLabel}>
                          <ImageIcon size={24} color="#00B14F" />
                          <span>Chọn {newImageFiles.length > 0 ? `${newImageFiles.length} ảnh` : 'ảnh từ máy tính...'}</span>
                        </label>
                        {newImageFiles.length > 0 && (
                          <button 
                            className={styles.actionBtn} 
                            onClick={handleAddImage}
                          >
                            Tải lên
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  <div className={styles.imagesGrid}>
                    {job.images && job.images.length > 0 ? (
                      job.images.map((img) => (
                        <div key={img.imageId} className={styles.imageCard}>
                          <img src={img.imageUrl} alt="Job Image" />
                          {isEditing && (
                            <button className={styles.deleteImageBtn} onClick={() => handleDeleteImage(img.imageId)}>
                              <Trash size={16} />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                        Chưa có hình ảnh nào.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'APPLICANTS' && (
            <div className={styles.applicantsTab}>
              <div className={styles.card}>
                {applicants.length === 0 ? (
                  <div className={styles.emptyState}>
                    <User size={36} color="#9CA3AF" />
                    <p style={{ marginTop: 10, color: '#6B7280' }}>Chưa có ứng viên nào ứng tuyển vào công việc này.</p>
                  </div>
                ) : (
                  <div className={styles.applicantList}>
                    {applicants.map((app) => (
                      <div key={app.applicationId} className={styles.applicantItem}>
                        <img src={app.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(app.name)} alt="avatar" className={styles.applicantAvatar} />
                        <div className={styles.applicantInfo}>
                          <h4>{app.name}</h4>
                          <p>Nộp ngày: {app.appliedDate}</p>
                          <div className={`${styles.appStatusBadge} ${styles['appStatus' + app.status]}`}>
                            {app.status === 'PENDING' ? 'CHỜ DUYỆT' : app.status === 'ACCEPTED' ? 'ĐÃ CHẤP NHẬN' : 'ĐÃ TỪ CHỐI'}
                          </div>
                        </div>
                        <div className={styles.applicantActions}>
                          <button className={styles.viewCvBtn} onClick={() => setSelectedProfile(app)}><FileText size={16} /> Xem hồ sơ</button>
                          <div className={styles.applicantActionGroup}>
                            <button className={styles.btnApprove} onClick={() => handleUpdateApplicantStatus(app.applicationId, 'ACCEPTED')}><CheckCircle size={16} /> Duyệt</button>
                            <button className={styles.btnReject} onClick={() => handleUpdateApplicantStatus(app.applicationId, 'REJECTED')}><X size={16} /> Từ chối</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'COMMENTS' && (
            <div className={styles.commentsTab}>
              <div className={styles.card}>
                {comments.length === 0 ? (
                  <div className={styles.emptyState}>
                    <MessageSquare size={36} color="#9CA3AF" />
                    <p style={{ marginTop: 10, color: '#6B7280' }}>Chưa có đánh giá nào cho công việc này.</p>
                  </div>
                ) : (
                  <div className={styles.commentList}>
                    {comments.map((cmt) => (
                      <div key={cmt.reviewId} className={styles.commentItem}>
                        <img src={cmt.reviewerAvatar || 'https://ui-avatars.com/api/?name=' + cmt.reviewerName} alt="avatar" className={styles.commentAvatar} />
                        <div className={styles.commentBody}>
                          <div className={styles.commentHeader}>
                            <h4>{cmt.reviewerName}</h4>
                            <span className={styles.commentDate}>{cmt.date}</span>
                          </div>
                          <div className={styles.commentRating}>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} fill={i < cmt.rating ? '#F59E0B' : '#E5E7EB'} color={i < cmt.rating ? '#F59E0B' : '#E5E7EB'} />
                            ))}
                          </div>
                          <p className={styles.commentText}>{cmt.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={!!selectedProfile} 
        onClose={() => setSelectedProfile(null)} 
        profile={selectedProfile ? {
          applicantName: selectedProfile.name,
          applicantAvatar: selectedProfile.avatar,
          applicantEmail: selectedProfile.email,
          applicantPhone: selectedProfile.phone,
          jobTitle: selectedProfile.jobTitle,
          appliedDate: selectedProfile.appliedDate,
          appliedTime: selectedProfile.appliedTime,
          status: selectedProfile.status,
          note: selectedProfile.note
        } : null}
      />
    </div>
  );
};
